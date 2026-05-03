import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db, supabase } from './src/server/db.ts';
import { startMentorMatchFlow, findLearningClusters } from './src/server/agent.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // API Routes
  app.get('/api/community', async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
          return res.json(data.map(mapProfile));
        }
      }
    } catch (e) {
      console.error('Supabase error on /api/community:', e);
    }
    res.json(db.members);
  });

  app.post('/api/community/join', async (req, res) => {
    const { name, role, teach, learn } = req.body;
    
    try {
      if (supabase) {
        const newProfile = {
          name,
          role: role,
          can_teach: teach || [],
          wants_to_learn: learn || [],
          is_gdg: false
        };
        
        const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
        if (!error && data) {
          return res.json({ success: true, member: mapProfile(data) });
        }
      }
    } catch (e) {
      console.error('Supabase error on /api/community/join:', e);
    }

    // Fallback Mock DB
    const newMember = {
      id: Math.random().toString(36).substring(7),
      name,
      roles: [role],
      bio: "Joined via Quick Join QR code! Ready to build.",
      teach: teach || [],
      learn: learn || [],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      isGdgMember: false
    };
    
    db.members.push(newMember);
    res.json({ success: true, member: newMember });
  });

  app.get('/api/network', async (req, res) => {
    let rawMembers: any[] = db.members;

    try {
      if (supabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
          rawMembers = data.map(mapProfile);
        }
      }
    } catch (e) {
      console.error('Supabase error on /api/network:', e);
    }

    // Generate nodes and edges
    const nodes = (rawMembers || []).map(m => ({
      id: m.id,
      name: m.name,
      role: (m.roles || [])[0] || "Member",
      level: (m.roles || []).some((r: string) => r.includes("Senior") || r.includes("Lead") || r.includes("Architect")) ? "Senior" : "Intermediate",
      avatar_color: m.id === "1" ? "#1D9E75" : "#7F77DD", // arbitrary colors for now
      data: { label: m.name, roles: m.roles || [], skills: m.teach || [], learn: m.learn || [], avatar: m.avatar, bio: m.bio },
    }));

    const edges: any[] = [];
    const edgeSet = new Set();

    (rawMembers || []).forEach(member => {
      (member.learn || []).forEach((skillToLearn: string) => {
        const potentialMentors = (rawMembers || []).filter(m => m.id !== member.id && (m.teach || []).some((t: string) => t.toLowerCase() === skillToLearn.toLowerCase()));
        potentialMentors.forEach(mentor => {
          const edgeId = `${member.id}-${mentor.id}-${skillToLearn}`;
          if (!edgeSet.has(edgeId) && !edgeSet.has(`${mentor.id}-${member.id}-${skillToLearn}`)) {
            edges.push({
              source: member.id,
              target: mentor.id,
              shared_skills: [skillToLearn],
              id: edgeId
            });
            edgeSet.add(edgeId);
          }
        });
      });
    });

    res.json({ nodes, edges });
  });

  app.post('/api/agent/clusters', async (req, res) => {
    try {
      const clusters = await findLearningClusters();
      res.json(clusters);
    } catch (err) {
      console.error("Cluster generation error", err);
      res.status(500).json({ error: "Failed to generate clusters" });
    }
  });

  app.post('/api/agent/mentor-match', (req, res) => {
    // This endpoint triggers an SSE stream
    const { input } = req.body;
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Start the generator
    startMentorMatchFlow(input, res).catch(err => {
      console.error(err);
      res.write(`data: ${JSON.stringify({ step: 'error', message: 'An error occurred during matching.' })}\n\n`);
      res.end();
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production handling
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
