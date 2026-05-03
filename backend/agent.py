from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from .models import AgentState, CommunityMember
import json
import os

# Setup LLM - Assuming API key is in environment variables (GEMINI_API_KEY)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-pro-exp", temperature=0.2)

# Mock Database for Community Members
MOCK_MEMBERS = [
    CommunityMember(
        id="1", name="Snehangshu", role="Senior Developer", city="Kolkata", company="TechCorp",
        can_teach=["Python", "FastAPI", "React", "System Design"], wants_to_learn=["Machine Learning"],
        level="Senior", is_gdg_member=True, avatar_color="#1D9E75"
    ),
    CommunityMember(
        id="2", name="Nasirul", role="Frontend Architect", city="Kolkata", company="WebInc",
        can_teach=["React", "Tailwind CSS", "UX Design"], wants_to_learn=["GraphQL"],
        level="Senior", is_gdg_member=True, avatar_color="#7F77DD"
    )
]

def extract_profile(state: AgentState) -> AgentState:
    state["current_step"] = "extract_profile"
    state["logs"].append("Extracting profile information from user input...")
    
    prompt = PromptTemplate(
        template="Extract the skills this user wants to LEARN, their current LEVEL, and GOALS from the following input.\nInput: {input}\n\nFormat exactly as JSON: {{\"skills_to_learn\": [\"skill1\"], \"level\": \"beginner/intermediate\", \"goals\": \"summary string\"}}",
        input_variables=["input"]
    )
    
    chain = prompt | llm | JsonOutputParser()
    try:
        res = chain.invoke({"input": state["user_input"]})
        state["extracted_profile"] = res
        state["logs"].append(f"Extraction successful: {res}")
    except Exception as e:
        state["extracted_profile"] = {"skills_to_learn": [], "level": "unknown", "goals": "unknown"}
        state["logs"].append(f"Extraction failed: {e}")
        
    return state

def find_matches(state: AgentState) -> AgentState:
    state["current_step"] = "find_matches"
    state["logs"].append("Finding the best mentors based on extracted skills overlap...")
    
    skills_to_learn = state.get("extracted_profile", {}).get("skills_to_learn", [])
    
    matches = []
    for member in MOCK_MEMBERS:
        overlap = [s for s in skills_to_learn if any(t.lower() in s.lower() or s.lower() in t.lower() for t in member.can_teach)]
        if overlap or not skills_to_learn: # default match if no skills
            matches.append({
                "mentor": member.model_dump(),
                "overlap": overlap if overlap else member.can_teach[:2]
            })
            
    # Sort matches by the highest overlap len
    matches.sort(key=lambda x: len(x["overlap"]), reverse=True)
    state["matched_mentors"] = matches[:2] # Top 2
    state["logs"].append(f"Found {len(state['matched_mentors'])} suitable matches.")
    return state

def generate_roadmap(state: AgentState) -> AgentState:
    state["current_step"] = "generate_roadmap"
    state["logs"].append("Generating 4-week roadmap using Gemini Pro...")
    
    if not state.get("matched_mentors"):
        state["roadmap"] = {"roadmap": []}
        return state
        
    best_match = state["matched_mentors"][0]
    prompt_str = f"Create a practical 4-week learning roadmap for a student learning {', '.join(best_match['overlap'])} from mentor {best_match['mentor']['name']} (who teaches {', '.join(best_match['mentor']['can_teach'])}). Return exactly JSON format: {{\"roadmap\": [{{\"week\": 1, \"plan\": \"string\"}}]}}"
    
    try:
        res = getattr(llm, "invoke")(prompt_str)
        content = res.content.replace("```json", "").replace("```", "").strip()
        state["roadmap"] = json.loads(content)
        state["logs"].append("Roadmap generated.")
    except Exception as e:
        state["roadmap"] = {"roadmap": []}
        state["logs"].append(f"Roadmap generation failed: {e}")
        
    return state

def draft_outreach(state: AgentState) -> AgentState:
    state["current_step"] = "draft_outreach"
    state["logs"].append("Drafting community-forward outreach messages honoring Kiran's legacy...")
    
    drafts = []
    for match in state.get("matched_mentors", []):
        mentor_name = match["mentor"]["name"]
        prompt_str = f"Write a short, warm, culturally-appropriate outreach message to {mentor_name} asking for mentorship in {', '.join(match['overlap'])}. Mention Kiran's legacy of connecting devs in the Kolkata tech community. Keep it sincere but not overly dramatic."
        try:
            res = llm.invoke(prompt_str)
            drafts.append({"mentor_id": match["mentor"]["id"], "message": res.content})
        except Exception:
            drafts.append({"mentor_id": match["mentor"]["id"], "message": "Hi! I'd love to connect and learn from you. I found you via Kiran's Corner."})
            
    state["drafted_messages"] = drafts
    state["logs"].append("Outreach drafted.")
    return state

# Define LangGraph State Machine
graph = StateGraph(AgentState)

# Add Nodes
graph.add_node("extract_profile", extract_profile)
graph.add_node("find_matches", find_matches)
graph.add_node("generate_roadmap", generate_roadmap)
graph.add_node("draft_outreach", draft_outreach)

# Set up Edges and Flow
graph.set_entry_point("extract_profile")
graph.add_edge("extract_profile", "find_matches")
graph.add_edge("find_matches", "generate_roadmap")
graph.add_edge("generate_roadmap", "draft_outreach")
graph.add_edge("draft_outreach", END)

# Compile into a runnable workflow
workflow = graph.compile()
