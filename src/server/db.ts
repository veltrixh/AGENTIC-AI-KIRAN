import { createClient } from '@supabase/supabase-js';

const envSupabaseUrl = process.env.SUPABASE_URL;
const supabaseUrl = (envSupabaseUrl && envSupabaseUrl.trim() !== '') ? envSupabaseUrl.trim() : 'https://phdpkrkfkprfafxzueoe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Mock data fallback if Supabase is not configured yet
export const mockMembers = [
  {
    id: "1",
    name: "Kiran Mishra",
    roles: ["Frontend Developer", "Community Builder"],
    bio: "Passionate about creating accessible interfaces and bringing people together. In loving memory. 🕊️",
    teach: ["React", "JavaScript", "Community Building"],
    learn: ["Backend Architecture", "PostgreSQL"],
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=KM",
    isGdgMember: true
  },
  {
    id: "2",
    name: "Aarika Sen",
    roles: ["Full Stack Engineer"],
    bio: "Building inclusive platforms. Love mentoring juniors.",
    teach: ["Python", "FastAPI", "React", "PostgreSQL"],
    learn: ["Machine Learning", "System Design"],
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS",
    isGdgMember: true
  },
  {
    id: "3",
    name: "Rohan Das",
    roles: ["Data Scientist"],
    bio: "Living in data points. Always excited to talk about models and inference.",
    teach: ["Machine Learning", "Python", "Data Science"],
    learn: ["FastAPI", "Mops"],
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RD",
    isGdgMember: false
  },
  {
    id: "4",
    name: "Sneha Roy",
    roles: ["UX Designer"],
    bio: "Crafting experiences that feel right. Kolkata tech scene enthusiast.",
    teach: ["Figma", "UX Research", "UI Design"],
    learn: ["React", "Framer Motion"],
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SR",
    isGdgMember: true
  },
  {
    id: "5",
    name: "Vikram Chatterjee",
    roles: ["Backend Developer"],
    bio: "Optimizing the invisible parts of the web.",
    teach: ["System Design", "Go", "PostgreSQL"],
    learn: ["UX Design", "Frontend Architecture"],
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VC",
    isGdgMember: false
  }
];

export const supabase = supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey && supabaseKey.trim() !== '' ? createClient(supabaseUrl, supabaseKey.trim()) : null;

// Kept for legacy routes not yet migrated
export const db = {
  members: mockMembers
};
