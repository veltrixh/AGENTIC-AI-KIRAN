from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
from database import get_supabase

app = FastAPI(title="Kiran's Corner API")
supabase = get_supabase()

class ProfileCreate(BaseModel):
    name: str
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    can_teach: List[str] = []
    wants_to_learn: List[str] = []
    is_gdg: bool = False

@app.get("/api/community")
def get_community():
    response = supabase.table("profiles").select("*").execute()
    return response.data

@app.post("/api/community/join")
def join_community(profile: ProfileCreate):
    new_profile = {
        "id": str(uuid.uuid4()),
        "name": profile.name,
        "github_username": profile.github_username,
        "avatar_url": profile.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={profile.name}",
        "role": profile.role,
        "can_teach": profile.can_teach,
        "wants_to_learn": profile.wants_to_learn,
        "is_gdg": profile.is_gdg,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    response = supabase.table("profiles").insert(new_profile).execute()
    return {"success": True, "member": response.data[0]}

@app.get("/api/network")
def get_network():
    response = supabase.table("profiles").select("*").execute()
    profiles = response.data
    
    nodes = []
    edges = []
    edge_set = set()

    for p in profiles:
        nodes.append({
            "id": p["id"],
            "name": p["name"],
            "role": p["role"],
            "level": "Senior" if any(r in p["role"] for r in ["Senior", "Lead", "Architect"]) else "Intermediate",
            "avatar_color": "#1D9E75" if p.get("is_gdg") else "#7F77DD",
            "data": p
        })

    for p in profiles:
        for skill_to_learn in p.get("wants_to_learn", []):
            potential_mentors = [m for m in profiles if m["id"] != p["id"] and any(t.lower() == skill_to_learn.lower() for t in m.get("can_teach", []))]
            for mentor in potential_mentors:
                edge_id = f"{p['id']}-{mentor['id']}-{skill_to_learn}"
                reverse_edge = f"{mentor['id']}-{p['id']}-{skill_to_learn}"
                
                if edge_id not in edge_set and reverse_edge not in edge_set:
                    edge_set.add(edge_id)
                    edges.append({
                        "id": edge_id,
                        "source": p["id"],
                        "target": mentor["id"],
                        "name": skill_to_learn
                    })
                    
    return {"nodes": nodes, "edges": edges}
