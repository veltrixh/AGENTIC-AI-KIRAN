from pydantic import BaseModel
from typing import List, Optional, Dict, Any, TypedDict

class CommunityMember(BaseModel):
    id: str
    name: str
    role: str
    city: str
    company: str
    can_teach: List[str]
    wants_to_learn: List[str]
    level: str
    is_gdg_member: bool
    avatar_color: str

class AgentState(TypedDict):
    user_input: str
    extracted_profile: Optional[Dict[str, Any]]
    matched_mentors: List[Dict[str, Any]]
    roadmap: Optional[Dict[str, Any]]
    drafted_messages: List[Dict[str, Any]]
    current_step: str
    logs: List[str]
