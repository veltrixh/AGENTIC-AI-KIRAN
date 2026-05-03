import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables not found.")

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
