from fastapi import FastAPI, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
import json
from dotenv import load_dotenv

from .models import CommunityMember, AgentState
from .agent import workflow, MOCK_MEMBERS

# Load environment variables
load_dotenv()

app = FastAPI(title="Kiran's Corner API - Agentic Backend")

# Enable CORS for the Vite React frontend (typically running on localhost:5173 or equivalent)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")
    return api_key

class MentorMatchRequest(BaseModel):
    input: str

@app.get("/api/community")
async def get_community():
    """Returns the mock list of community members."""
    return [m.model_dump() for m in MOCK_MEMBERS]

@app.post("/api/agent/mentor-match")
async def mentor_match(req: MentorMatchRequest, api_key: str = Depends(get_api_key)):
    """
    Triggers the LangGraph agent pipeline. Streams output back to the frontend 
    using Server-Sent Events (SSE) so the React app can display real-time progress.
    """
    async def event_generator():
        # Initialize Agent State
        initial_state: AgentState = {
            "user_input": req.input,
            "extracted_profile": None,
            "matched_mentors": [],
            "roadmap": None,
            "drafted_messages": [],
            "current_step": "init",
            "logs": ["Starting Agentic Pipeline..."]
        }
        
        # Iterate over the agent state as each node completes
        for output in workflow.stream(initial_state):
            # Output represents state updates from the just-executed node
            for node_name, state_update in output.items():
                step_data = {
                    "step": node_name,
                    "message": f"Executing: {node_name}",
                    "details": state_update.get("logs", [])
                }
                
                # Yield SSE chunk
                yield f"data: {json.dumps(step_data)}\n\n"
                
                # Small sleep for visual pacing on the frontend
                await asyncio.sleep(0.5) 
                
            # Maintain our running state copy
            initial_state.update(state_update)

        # After the graph has exhausted, construct the final Complete payload
        final_data = {
            "step": "Complete",
            "message": "Pipeline complete.",
            "matches": []
        }
        
        # Combine the scattered state properties (mentors, roadmaps, drafts) into unified 'matches'
        for i, match in enumerate(initial_state.get("matched_mentors", [])):
            match_data = {
                "mentor": match["mentor"],
                "draftMessage": "",
                "roadmap": []
            }
            if i < len(initial_state.get("drafted_messages", [])):
                match_data["draftMessage"] = initial_state["drafted_messages"][i]["message"]
            
            # For simplicity, assign the generated roadmap to the top match
            if i == 0 and initial_state.get("roadmap", {}).get("roadmap"):
                match_data["roadmap"] = initial_state["roadmap"]["roadmap"]
                
            final_data["matches"].append(match_data)
            
        yield f"data: {json.dumps(final_data)}\n\n"

    # Return as an Event Stream
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    # Typically running on port 8000 for the FastAPI server
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
