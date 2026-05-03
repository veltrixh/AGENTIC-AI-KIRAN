import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NodeData = {
  id: string;
  name: string;
  role: string;
  level: string;
  avatar_color: string;
  data: any;
  val: number;
  color?: string; // used for clustering
};

type EdgeData = {
  id: string;
  source: string;
  target: string;
  shared_skills: string[];
};

type Cluster = {
  id: string;
  name: string;
  emoji: string;
  member_ids: string[];
  shared_focus: string;
  why_together: string;
  suggested_project: string;
};

export default function NetworkMap() {
  const navigate = useNavigate();
  const graphRef = useRef<any>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [graphData, setGraphData] = useState<{nodes: NodeData[], edges: EdgeData[]}>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  
  const [hoverNode, setHoverNode] = useState<NodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  
  const [isClustering, setIsClustering] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setWindowDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch initial graph
  useEffect(() => {
    fetch('/api/network')
      .then(res => res.json())
      .then(data => {
        // give nodes some starting val for sizing
        const nodes = data.nodes.map((n: any) => ({ ...n, val: 5 }));
        setGraphData({ nodes, edges: data.edges });
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node || null);
    
    if (node) {
      const newHighlightNodes = new Set();
      const newHighlightLinks = new Set();
      newHighlightNodes.add(node.id);
      
      graphData.edges.forEach(edge => {
        if (edge.source === node.id || edge.target === node.id) {
          const s = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
          const t = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
          newHighlightLinks.add(edge.id);
          newHighlightNodes.add(s);
          newHighlightNodes.add(t);
        }
      });
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => {
    // Check if it's already an expanded node (the object has x/y because force-graph mutated it)
    setSelectedNode(node);
  }, []);

  const findClusters = async () => {
    setIsClustering(true);
    try {
      const response = await fetch('/api/agent/clusters', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data && data.clusters) {
        setClusters(data.clusters);
        
        // Update node colors based on cluster
        const clusterColors = ['#1D9E75', '#F59E0B', '#3B82F6', '#EC4899']; // Palette for clusters
        
        const newNodes = graphData.nodes.map(n => {
          const clusterIndex = data.clusters.findIndex((c: Cluster) => c.member_ids.includes(n.id));
          return {
            ...n,
            color: clusterIndex !== -1 ? clusterColors[clusterIndex % clusterColors.length] : 'rgba(200, 200, 200, 0.2)'
          };
        });
        
        setGraphData(prev => ({ ...prev, nodes: newNodes }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClustering(false);
    }
  };

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const r = node.val;
    
    const isHighlighted = highlightNodes.has(node.id);
    const isMuted = highlightNodes.size > 0 && !isHighlighted;
    
    // Draw Glow
    const baseColor = node.color || node.avatar_color || '#9D94FF';
    
    if (!isMuted) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${baseColor}33`; // 20% opacity glow
      ctx.fill();
    }

    // Draw Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    
    // Color
    ctx.fillStyle = isMuted ? 'rgba(255, 255, 255, 0.1)' : baseColor;
    ctx.fill();
    
    if (isHighlighted) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    // Draw Text
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isMuted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)';
    ctx.fillText(label, node.x, node.y + r + 4);
  };

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] bg-[#0A0A0B] overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      
      {/* Top Left Floating Header */}
      <div className="absolute top-6 left-6 z-10 max-w-sm pointer-events-none">
        <h1 className="text-3xl font-bold tracking-tight text-white/90 bg-[#0A0A0B]/80 backdrop-blur pb-1 px-3 -ml-3 rounded-lg inline-block border border-white/5">Network Map</h1>
        <p className="text-[var(--color-text-secondary)] font-medium bg-[#0A0A0B]/80 backdrop-blur px-3 py-1 -ml-3 rounded-lg inline-block mt-2 border border-white/5">Connecting the dots in Kolkata's tech ecosystem.</p>
      </div>

      {/* Top Right Floating Action */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={findClusters}
          disabled={loading || isClustering}
          className="flex items-center gap-2 px-5 py-3 bg-[#9D94FF] text-[#0A0A0B] font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#b0a8ff] disabled:opacity-50 transition-all active:scale-95 glow-purple"
        >
          {isClustering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Find Learning Clusters
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-move">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0B]">
             <div className="w-8 h-8 rounded-full border-4 border-[#9D94FF]/20 border-t-[#9D94FF] animate-spin"></div>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            width={windowDimensions.width}
            height={windowDimensions.height}
            graphData={{ nodes: graphData.nodes, links: graphData.edges }}
            nodeLabel=""
            nodeCanvasObject={drawNode}
            linkColor={(link: any) => highlightLinks.has(link.id) ? 'rgba(255,255,255,0.6)' : 'rgba(255, 255, 255, 0.1)'}
            linkWidth={(link: any) => highlightLinks.has(link.id) ? 2 : 1}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            enableZoomInteraction={true}
          />
        )}
      </div>

      {/* Right Slide-Over Panel for Profile */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 bottom-0 right-0 w-80 glass-card border-l border-white/10 shadow-2xl z-20 flex flex-col glow-purple"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white">Profile Outline</h3>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-white/10 rounded-lg text-[var(--color-text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               <img src={selectedNode.data.avatar} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/10 shadow-sm" />
               <h2 className="text-2xl font-bold text-center text-white mb-1">{selectedNode.name}</h2>
               <p className="text-sm font-medium text-[#9D94FF] text-center mb-6">{selectedNode.data.roles.join(" • ")}</p>
               
               <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 text-center">{selectedNode.data.bio}</p>

               <div className="space-y-6">
                 <div>
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Can Teach</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedNode.data.skills.map((s: string) => (
                       <span key={s} className="px-2 py-1 rounded-md text-xs bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 font-bold">{s}</span>
                     ))}
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Wants to Learn</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedNode.data.learn.map((s: string) => (
                       <span key={s} className="px-2 py-1 rounded-md text-xs bg-white/10 text-[var(--color-text-primary)] border border-white/5 font-bold">{s}</span>
                     ))}
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0A0A0B]/50">
               <button 
                 onClick={() => navigate('/mentor')}
                 className="w-full flex items-center justify-center gap-2 py-3 bg-[#2DD4BF] hover:bg-[#46dfcb] text-[#0A0A0B] font-bold rounded-xl transition shadow-sm active:scale-95 glow-teal"
               >
                 Find Mentor Match
                 <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Clusters Panel */}
      <AnimatePresence>
        {clusters.length > 0 && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 glass-card border-t border-white/10 shadow-[0_-10px_40px_rgba(157,148,255,0.1)] z-20 p-6 sm:p-8 rounded-t-3xl max-h-[50vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#9D94FF]" /> AI Generated Learning Circles
              </h3>
              <button onClick={() => { setClusters([]); setGraphData(prev => ({...prev, nodes: prev.nodes.map(n => ({...n, color: n.avatar_color}))})) }} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-[var(--color-text-secondary)] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clusters.map((cluster, i) => {
                 const clusterColors = ['bg-[#2DD4BF]/5 border-[#2DD4BF]/20', 'bg-[#F59E0B]/5 border-[#F59E0B]/20', 'bg-[#3B82F6]/5 border-[#3B82F6]/20'];
                 const textColors = ['text-[#2DD4BF]', 'text-[#F59E0B]', 'text-[#3B82F6]'];
                 const colorClass = clusterColors[i % clusterColors.length];
                 const textClass = textColors[i % textColors.length];
                 
                 return (
                  <div key={cluster.id} className={`rounded-2xl p-6 border ${colorClass}`}>
                    <div className="text-4xl mb-3">{cluster.emoji}</div>
                    <h4 className="text-lg font-bold text-white mb-1">{cluster.name}</h4>
                    <p className={`text-xs font-bold uppercase tracking-widest ${textClass} mb-4`}>{cluster.shared_focus}</p>
                    
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                      {cluster.why_together}
                    </p>
                    
                    <div className="bg-[#0A0A0B]/50 p-3 rounded-lg border border-white/5">
                      <strong className="text-xs text-white block mb-1">Suggested Project:</strong>
                      <p className="text-xs text-[var(--color-text-secondary)]">{cluster.suggested_project}</p>
                    </div>
                  </div>
                 )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
