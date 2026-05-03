import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, LogOut, Github, Sparkles } from 'lucide-react';

export default function AuthUI() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGdg, setIsGdg] = useState(false);
  const [teach, setTeach] = useState('');
  const [learn, setLearn] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkProfile(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (currentSession: any) => {
    if (!currentSession || !supabase) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', currentSession.user.id)
      .single();
      
    if (!profile) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleLogin = async () => {
    if (!supabase) return alert("Supabase is not configured.");
    
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const completeOnboarding = async () => {
    if (!supabase || !session) return;
    
    const user = session.user;
    const profile = {
      id: user.id,
      name: user.user_metadata.full_name || user.user_metadata.user_name || 'Anonymous',
      github_username: user.user_metadata.user_name,
      avatar_url: user.user_metadata.avatar_url,
      role: 'Member', // Default role
      can_teach: teach.split(',').map(s => s.trim()).filter(Boolean),
      wants_to_learn: learn.split(',').map(s => s.trim()).filter(Boolean),
      is_gdg: isGdg
    };

    const { error } = await supabase.from('profiles').insert(profile);
    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setShowOnboarding(false);
      // Reload page to reflect new member in lists
      window.location.reload(); 
    }
  };
  
  if (!supabase) return null; // Hide UI if supabase not configured
  
  if (loading) return <div className="w-8 h-8 rounded-full border-2 border-t-[#9D94FF] animate-spin border-[#9D94FF]/20"></div>;

  return (
    <>
      {!session ? (
        <button 
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-lg transition-all active:scale-95"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">Connect GitHub</span>
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <img 
              src={session.user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-6 h-6 rounded-full ring-2 ring-[#9D94FF]/20" 
            />
            <span className="text-sm font-bold text-white max-w-[100px] truncate">
              {session.user.user_metadata.user_name}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 text-[#EF4444] font-bold rounded-lg transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-2xl glow-purple border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#9D94FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#9D94FF]/20">
                <Sparkles className="w-8 h-8 text-[#9D94FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Kiran's Corner</h2>
              <p className="text-[var(--color-text-secondary)] text-sm">Let's set up your developer profile. What can you share, and what do you want to learn?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-1.5 opacity-80">I can teach (comma separated)</label>
                <input 
                  type="text" 
                  value={teach}
                  onChange={e => setTeach(e.target.value)}
                  placeholder="e.g. React, Python, UI Design"
                  className="w-full bg-[#0A0A0B]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#9D94FF] focus:ring-1 focus:ring-[#9D94FF] placeholder:text-white/20 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1.5 opacity-80">I want to learn (comma separated)</label>
                <input 
                  type="text" 
                  value={learn}
                  onChange={e => setLearn(e.target.value)}
                  placeholder="e.g. Machine Learning, Go, DevRel"
                  className="w-full bg-[#0A0A0B]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] placeholder:text-white/20 transition-all font-medium"
                />
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                 <button 
                  onClick={() => setIsGdg(!isGdg)}
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    isGdg ? 'bg-[#9D94FF] border-[#9D94FF]' : 'bg-[#0A0A0B]/50 border-white/20'
                  }`}
                 >
                   {isGdg && <svg className="w-4 h-4 text-[#0A0A0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </button>
                 <span className="text-sm font-bold text-white/80 select-none">I am a GDG Kolkata member</span>
              </div>
              
              <button 
                onClick={completeOnboarding}
                disabled={!teach || !learn}
                className="w-full mt-6 py-3 bg-[#9D94FF] hover:bg-[#b0a8ff] text-[#0A0A0B] font-bold rounded-lg transition-colors disabled:opacity-50 active:scale-95 glow-purple"
              >
                Join the Network
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
