import { useEffect, useState } from "react";
import { Search, Code2, PenTool, Database, Hash, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

type Member = {
  id: string;
  name: string;
  roles: string[];
  bio: string;
  teach: string[];
  learn: string[];
  avatar: string;
  isGdgMember?: boolean;
};

export default function Community() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/community")
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filters = ["All", "Developer", "Designer", "Data", "GDG Member"];

  const filteredMembers = (members || []).filter(m => {
    if (filter === "All") return true;
    
    if (filter === "GDG Member") {
        return m.isGdgMember;
    }
    
    const allText = (m.roles.join(" ") + " " + m.teach.join(" ")).toLowerCase();
    
    if (filter === "Developer") return allText.includes("develop") || allText.includes("engineer");
    if (filter === "Designer") return allText.includes("design") || allText.includes("ux");
    if (filter === "Data") return allText.includes("data") || allText.includes("machine learning");
    
    return allText.includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-8 min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Community Directory</h1>
          <p className="text-lg text-[var(--color-text-secondary)] mt-1">Connect, learn, and build the Kolkata tech ecosystem together.</p>
        </div>
        
        <div className="flex gap-2 p-1.5 glass-card rounded-xl overflow-x-auto max-w-full relative z-10">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                filter === f ? "bg-[#9D94FF] text-[#0A0A0B] shadow-sm glow-purple" : "text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, i) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
              className="glass-card rounded-2xl p-6 flex flex-col group hover:shadow-lg transition-all hover:border-[#9D94FF]/50 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <img src={member.avatar} alt={member.name} className="w-14 h-14 bg-white/10 rounded-full ring-4 ring-white/5 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#9D94FF] transition-colors truncate text-glow-purple">{member.name}</h3>
                    {member.isGdgMember && (
                      <span title="GDG Kolkata Member" className="shrink-0 flex items-center justify-center bg-[#2DD4BF]/10 text-[#2DD4BF] p-1.5 rounded-full ring-1 ring-[#2DD4BF]/30">
                        <HeartHandshake className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#2DD4BF] truncate mt-0.5">{member.roles.join(" • ")}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 flex-1 line-clamp-3 relative z-10 leading-relaxed disabled:opacity-50">{member.bio}</p>
              
              <div className="space-y-3 pt-5 border-t border-white/10 relative z-10">
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex justify-between items-center">
                    <span>Expertise</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.teach.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-md text-xs bg-white/10 text-white border border-white/5 font-bold whitespace-nowrap">
                        {skill}
                      </span>
                    ))}
                    {member.teach.length > 3 && <span className="px-2.5 py-1 rounded-md text-xs bg-white/5 text-[var(--color-text-secondary)] font-bold">+{member.teach.length - 3}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
               <p className="text-[var(--color-text-secondary)]">No members match your chosen filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
