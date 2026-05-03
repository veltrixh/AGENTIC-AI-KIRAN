import { GoogleGenAI } from "@google/genai";
import { db, supabase } from "./db.ts";
import type { Response } from "express";

// Helper function to map Supabase profiles to expected frontend shape
const mapProfile = (p: any) => ({
  id: p.id,
  name: p.name,
  roles: [p.role],
  bio: p.github_username ? `GitHub: @${p.github_username}` : "Platform member.",
  teach: p.can_teach || [],
  learn: p.wants_to_learn || [],
  avatar: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`,
  isGdgMember: p.is_gdg || false
});

async function getMembers() {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        return data.map(mapProfile);
      }
    }
  } catch (e) {
    console.error('Supabase error on getMembers:', e);
  }
  return db.members;
}

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

function sendSSE(res: Response, data: any) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function findLearningClusters() {
  const aiClient = getAI();
  const MODEL = "gemini-2.0-flash";
  const members = await getMembers();

  const prompt = `You are an AI community organizer honoring Kiran Mishra's legacy. 
Look at this JSON array of community members and their skills. 
Identify 3 optimal 'learning circles' (groups of 2-4 people) whose skills perfectly complement each other (where someone wants to learn what another teaches).

Members:
${JSON.stringify(members, null, 2)}

Output strictly in JSON format: 
{ 
  "clusters": [
    { 
      "id": "cluster-1", 
      "name": "Cluster Name", 
      "emoji": "🚀", 
      "member_ids": ["1", "2"], 
      "shared_focus": "What they have in common", 
      "why_together": "Brief explanation of why they are grouped", 
      "suggested_project": "A small project they can build together" 
    }
  ] 
}`;

  const response = await aiClient.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}

export async function startMentorMatchFlow(userInput: string, res: Response) {
  const aiClient = getAI();
  const MODEL = "gemini-2.0-flash"; // Using flash for quicker testing but can use gemini-2.5-pro

  try {
    // NODE 1: Intake & Extraction
    sendSSE(res, { step: "Extracting", message: "Analyzing your profile and goals..." });
    
    // Quick prompt for extraction
    const extractPrompt = `
    Extract the tech skills this user wants to LEARN and what their current level/goal is, based on their input.
    Input: "${userInput}"
    Return JSON format: {"skillsToLearn": ["skill1", "skill2"], "goal": "summary of goal"}
    `;
    
    const extractionResponse = await aiClient.models.generateContent({
      model: MODEL,
      contents: extractPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const extractionText = extractionResponse.text || "{}";
    const extractedData = JSON.parse(extractionText);
    
    // Simulate thinking time
    await new Promise(r => setTimeout(r, 1000));

    // NODE 2: Vector Search / Matcher (Simulated with basic array filtering based on extracted skills)
    sendSSE(res, { step: "Searching", message: "Searching community directory for overlap...", details: extractedData });
    
    const skillsToLearn = extractedData.skillsToLearn || [];
    const members = await getMembers();
    const matches = (members || [])
      .filter(m => m.id !== "1") // Don't match the mock current user or memorial profile easily, but actually let's match anyone.
      .map(m => {
        const overlap = (m.teach || []).filter(skill => 
          skillsToLearn.some((s: string) => s.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(s.toLowerCase()))
        );
        return { member: m, overlap };
      })
      .filter(entry => entry.overlap.length > 0)
      .sort((a, b) => b.overlap.length - a.overlap.length)
      .slice(0, 2);

    await new Promise(r => setTimeout(r, 1500));

    // NODE 3: Roadmap Generator
    sendSSE(res, { step: "Drafting", message: "Found matches. Generating personalized roadmaps..." });
    
    const roadmapsAndDrafts = [];

    for (const match of matches) {
      const roadmapPrompt = `
      Create a very brief 4-week roadmap for learning ${match.overlap.join(", ")}.
      The mentor is ${match.member.name} who teaches: ${match.member.teach.join(", ")}.
      Keep the roadmap concise (one sentence per week).
      Return JSON format: {
        "roadmap": [
          {"week": 1, "plan": "plan"},
          {"week": 2, "plan": "plan"},
          {"week": 3, "plan": "plan"},
          {"week": 4, "plan": "plan"}
        ],
        "draftMessage": "A warm outreach message to this mentor mentioning Kiran's corner and shared interests."
      }`;

      const roadmapResponse = await aiClient.models.generateContent({
        model: MODEL,
        contents: roadmapPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const generationText = roadmapResponse.text || "{}";
      const generationData = JSON.parse(generationText);
      roadmapsAndDrafts.push({
        mentor: match.member,
        roadmap: generationData.roadmap,
        draftMessage: generationData.draftMessage
      });
    }

    await new Promise(r => setTimeout(r, 1000));

    // NODE 4: Final output
    sendSSE(res, { 
      step: "Complete", 
      message: "Pipeline complete.", 
      matches: roadmapsAndDrafts 
    });

  } catch (error) {
    console.error("Agent execution error:", error);
    sendSSE(res, { step: "Error", message: "Failed to execute agentic workflow." });
  } finally {
    res.end();
  }
}
