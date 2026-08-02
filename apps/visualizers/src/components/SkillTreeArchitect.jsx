import { SEO } from '@packages/components';
import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  Button,
  CalculatorHeader,
  CalculatorLayout,
  Card,
  DownloadButtons,
  Footer,
  Input,
  Modal,
  ResultsAnalysis
} from '@packages/styling';
import { AnimatePresence, motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CheckCircle2, Circle, Database, Flag, GitMerge, Lock, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { calculateNodeLevels } from '../lib/skillTreeLogic';
import { PRESETS } from '../lib/skillTreePresets';

export default function SkillTreeArchitect() {
  const [nodes, setNodes] = usePersistedState('SkillTreeArchitect', 'nodes', PRESETS['solo-founder'].nodes);
  const [pendingPreset, setPendingPreset] = useState(null); // Holds the preset key to load after confirmation

  // State for adding a new node
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('skill');
  const [newNodeEffort, setNewNodeEffort] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodePrereqs, setNewNodePrereqs] = useState([]);

  // For the SVG overlay
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const [svgPaths, setSvgPaths] = useState([]);

  // Try to calculate levels; catch cycles to prevent crashing
  const { tiers, maxLevel, cycleError } = useMemo(() => {
    try {
      const result = calculateNodeLevels(nodes);
      return { ...result, cycleError: null };
    } catch (err) {
      return { tiers: [], maxLevel: 0, cycleError: err.message };
    }
  }, [nodes]);

  // Handle drawing lines between prerequisites
  const drawLines = () => {
    if (cycleError || !canvasRef.current) return;

    const newPaths = [];

    // Helper to get exact layout position relative to canvasRef, ignoring CSS transforms
    const getRelativePos = (el) => {
      let x = 0;
      let y = 0;
      let current = el;
      while (current && current !== canvasRef.current) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
      }
      return { x, y };
    };

    const nodeToTier = {};
    tiers.forEach((tierNodes, index) => {
      tierNodes.forEach((n) => {
        nodeToTier[n.id] = index;
      });
    });

    nodes.forEach((dependent) => {
      const depEl = nodeRefs.current[dependent.id];
      if (!depEl) return;

      const depPos = getRelativePos(depEl);
      const depWidth = depEl.offsetWidth;
      const depHeight = depEl.offsetHeight;

      // The dependent is higher up on the screen, so lines connect to its BOTTOM
      const depX = depPos.x + depWidth / 2;
      const depY = depPos.y + depHeight;

      (dependent.prereqs || []).forEach((prereqId) => {
        const preEl = nodeRefs.current[prereqId];
        if (!preEl) return;

        const prereq = nodes.find((n) => n.id === prereqId);
        const prePos = getRelativePos(preEl);
        const preWidth = preEl.offsetWidth;

        // The prerequisite is lower down on the screen, so lines connect from its TOP
        const preX = prePos.x + preWidth / 2;
        const preY = prePos.y;

        const preTier = nodeToTier[prereqId];
        const depTier = nodeToTier[dependent.id];

        let d = '';

        // Route orthogonally around boxes if the edge skips a tier
        if (depTier - preTier > 1) {
          let minX = Infinity;
          let maxX = -Infinity;
          for (let t = preTier + 1; t < depTier; t++) {
            tiers[t].forEach((n) => {
              const el = nodeRefs.current[n.id];
              if (el) {
                const pos = getRelativePos(el);
                minX = Math.min(minX, pos.x);
                maxX = Math.max(maxX, pos.x + el.offsetWidth);
              }
            });
          }

          if (minX !== Infinity) {
            // Decide whether to go around the left or right side based on midpoint
            const goLeft = (preX + depX) / 2 < (minX + maxX) / 2;

            // Add a small deterministic jitter based on node IDs to prevent perfectly overlapping lines
            const jitter = (dependent.id.charCodeAt(0) + prereqId.charCodeAt(0)) % 25;
            const channelX = goLeft ? minX - 30 - jitter : maxX + 30 + jitter;

            const y1 = preY - 25; // Stop going straight up 25px above prereq
            const y2 = depY + 25; // Start going straight up 25px below dependent

            // Dynamic bend radius so it doesn't overshoot if horizontally close
            const dir1 = channelX > preX ? 1 : -1;
            const R1 = Math.min(12, Math.abs(channelX - preX) / 2);

            const dir2 = depX > channelX ? 1 : -1;
            const R2 = Math.min(12, Math.abs(depX - channelX) / 2);

            // Manhattan routing with rounded corners using quadratic beziers (Q)
            d = `M ${preX},${preY} 
                 L ${preX},${y1 + R1} 
                 Q ${preX},${y1} ${preX + R1 * dir1},${y1} 
                 L ${channelX - R1 * dir1},${y1} 
                 Q ${channelX},${y1} ${channelX},${y1 - R1} 
                 L ${channelX},${y2 + R2} 
                 Q ${channelX},${y2} ${channelX + R2 * dir2},${y2} 
                 L ${depX - R2 * dir2},${y2} 
                 Q ${depX},${y2} ${depX},${y2 - R2} 
                 L ${depX},${depY}`;
          }
        }

        if (!d) {
          // Standard direct bezier for normal adjacent tier connections
          const yMid = (depY + preY) / 2;
          d = `M ${preX},${preY} C ${preX},${yMid} ${depX},${yMid} ${depX},${depY}`;
        }

        // Color based on status
        let strokeColor = '#9CA3AF'; // Gray (locked)
        if (prereq?.status === 'unlocked' && dependent.status === 'unlocked')
          strokeColor = '#10B981'; // Green
        else if (prereq?.status === 'unlocked') strokeColor = '#3B82F6'; // Blue (path open)

        newPaths.push({ d, strokeColor });
      });
    });

    setSvgPaths(newPaths);
  };

  // Re-draw lines when nodes change or window resizes
  useLayoutEffect(() => {
    // slight delay to ensure DOM has rendered flexbox layouts
    const timer = setTimeout(drawLines, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, tiers]);

  useEffect(() => {
    window.addEventListener('resize', drawLines);
    return () => window.removeEventListener('resize', drawLines);
  });

  // Node Actions
  const addNode = () => {
    if (!newNodeTitle.trim()) return;

    const newNode = {
      id: Date.now().toString(),
      title: newNodeTitle.trim(),
      category: newNodeCategory,
      effort: newNodeEffort.trim(),
      desc: newNodeDesc.trim(),
      status: 'locked',
      prereqs: [...newNodePrereqs]
    };

    // Check if adding this would cause a cycle
    try {
      calculateNodeLevels([...nodes, newNode]);
      setNodes([...nodes, newNode]);
      setNewNodeTitle('');
      setNewNodeCategory('skill');
      setNewNodeEffort('');
      setNewNodeDesc('');
      setNewNodePrereqs([]);
    } catch (err) {
      alert('Cannot add node: This would create a circular dependency (infinite loop).');
    }
  };

  const deleteNode = (id) => {
    // Remove the node itself
    let updatedNodes = nodes.filter((n) => n.id !== id);
    // Remove it from other nodes' prerequisites
    updatedNodes = updatedNodes.map((n) => ({
      ...n,
      prereqs: n.prereqs.filter((pid) => pid !== id)
    }));
    setNodes(updatedNodes);
  };

  const cycleStatus = (id) => {
    setNodes(
      nodes.map((n) => {
        if (n.id !== id) return n;
        let nextStatus = 'locked';
        if (n.status === 'locked') nextStatus = 'in-progress';
        else if (n.status === 'in-progress') nextStatus = 'unlocked';
        return { ...n, status: nextStatus };
      })
    );
  };

  const togglePrereq = (nodeId, prereqId) => {
    // Can't be a prereq of itself
    if (nodeId === prereqId) return;

    setNodes(
      nodes.map((n) => {
        if (n.id !== nodeId) return n;

        const newPrereqs = n.prereqs.includes(prereqId)
          ? n.prereqs.filter((id) => id !== prereqId)
          : [...n.prereqs, prereqId];

        return { ...n, prereqs: newPrereqs };
      })
    );
  };

  const handleDownloadPDF = async () => {
    const el = canvasRef.current;
    if (!el) return;
    // Hide editor for print
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('skill-tree-architect.pdf');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black p-4 md:p-8 font-sans">
      <SEO
        title="Skill Tree Architect Visualizer"
        description="Treat your life and career goals like an RPG skill tree. Visually map out prerequisites and capacity."
        keywords="skill tree, goal visualizer, roadmap, dependencies, neo-brutalism"
        canonical={`${import.meta.env.VITE_SITE_URL}/skill-tree`}
      />

      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="SkillTreeArchitect"
            icon={GitMerge}
            title="Skill Tree Architect"
            onReset={() => {
              resetPersistedState('SkillTreeArchitect');
            }}
          />
        </div>

        {/* LEFT Panel: Node Editor */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card title="Load Roadmaps" headerColor="bg-blue-300">
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700">
                Wipe your current tree and load a specialized roadmap template.
              </p>
              <select
                className="w-full border-4 border-black p-3 font-bold bg-white"
                value="" // Always empty to act as an action dropdown
                onChange={(e) => {
                  if (!e.target.value) return;
                  setPendingPreset(e.target.value);
                }}
              >
                <option value="">-- Select a Preset --</option>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
          <Card title="Add New Node" headerColor="bg-yellow-300">
            <div className="space-y-4">
              <Input
                id="newNodeTitle"
                label="Node Name / Goal"
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                placeholder="e.g. Learn React"
                className="font-black"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Category</label>
                  <select
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value)}
                    className="w-full border-4 border-black p-2 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  >
                    <option value="skill">Skill</option>
                    <option value="milestone">Milestone</option>
                    <option value="asset">Asset / Resource</option>
                  </select>
                </div>
                <Input
                  id="newNodeEffort"
                  label="Cost / Effort"
                  value={newNodeEffort}
                  onChange={(e) => setNewNodeEffort(e.target.value)}
                  placeholder="e.g. 40 hrs or $50"
                  className="font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2">Description</label>
                <textarea
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  placeholder="Optional details or links..."
                  className="w-full border-4 border-black p-2 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-yellow-300 min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2">Prerequisites for this node</label>
                <div className="max-h-32 overflow-y-auto border-2 border-black p-2 bg-white space-y-1">
                  {nodes.length === 0 ? (
                    <p className="text-[10px] font-bold text-gray-500 uppercase">No existing nodes</p>
                  ) : (
                    nodes.map((n) => (
                      <label key={n.id} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNodePrereqs.includes(n.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewNodePrereqs([...newNodePrereqs, n.id]);
                            else setNewNodePrereqs(newNodePrereqs.filter((id) => id !== n.id));
                          }}
                          className="accent-black"
                        />
                        {n.title}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={addNode}
                disabled={!newNodeTitle.trim()}
                className="w-full bg-black text-white p-3 font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Add Node
              </button>
            </div>
          </Card>

          <Card
            title="Edit Tree"
            headerColor="bg-black text-white"
            className="max-h-[600px] flex flex-col"
            bodyClassName="overflow-y-auto flex-1"
          >
            {cycleError && (
              <div className="p-3 bg-red-100 border-2 border-red-500 mb-4 text-xs font-bold text-red-700">
                ⚠️ {cycleError}
              </div>
            )}

            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.id} className="p-3 border-2 border-black bg-white flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-sm uppercase leading-tight pr-6">{node.title}</span>
                    <button
                      onClick={() => deleteNode(node.id)}
                      className="text-gray-400 hover:text-red-500 absolute top-2 right-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[10px] font-bold uppercase text-gray-500 mt-2">Prerequisites:</div>
                  <div className="flex flex-wrap gap-1">
                    {nodes
                      .filter((n) => n.id !== node.id)
                      .map((n) => {
                        const isChecked = node.prereqs.includes(n.id);
                        return (
                          <button
                            key={n.id}
                            onClick={() => togglePrereq(node.id, n.id)}
                            className={`text-[9px] px-1.5 py-0.5 border border-black font-bold uppercase transition-all ${isChecked ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                          >
                            {n.title}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="pt-2">
            <DownloadButtons onDownloadPDF={handleDownloadPDF} />
          </div>
        </div>

        {/* RIGHT Panel: The Tree Canvas */}
        <div className="lg:col-span-12 xl:col-span-8">
          <ResultsAnalysis>
            <div className="relative w-full overflow-x-auto overflow-y-hidden shadow-[inset_0px_0px_20px_rgba(0,0,0,0.05)] bg-[#FDFBF7] border-4 border-black">
              <div
                ref={canvasRef}
                className="relative min-h-[600px] w-max min-w-full mx-auto p-8 md:p-12 flex flex-col justify-end"
                style={{
                  backgroundImage: 'radial-gradient(#E5E7EB 2px, transparent 2px)',
                  backgroundSize: '30px 30px'
                }}
              >
                {/* SVG Overlay for Connections */}
                <svg
                  className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply opacity-90"
                  style={{ width: '100%', height: '100%' }}
                >
                  <defs>
                    {/* Arrowhead marker */}
                    <marker id="arrowhead-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#9CA3AF" />
                    </marker>
                    <marker id="arrowhead-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#3B82F6" />
                    </marker>
                    <marker id="arrowhead-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#10B981" />
                    </marker>
                  </defs>
                  <AnimatePresence>
                    {svgPaths.map((path, i) => {
                      let markerId = 'url(#arrowhead-gray)';
                      if (path.strokeColor === '#3B82F6') markerId = 'url(#arrowhead-blue)';
                      if (path.strokeColor === '#10B981') markerId = 'url(#arrowhead-green)';

                      return (
                        <motion.path
                          key={i}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          d={path.d}
                          fill="none"
                          stroke={path.strokeColor}
                          strokeWidth="3"
                          markerEnd={markerId}
                          className={path.strokeColor === '#9CA3AF' ? 'stroke-dasharray-4' : ''}
                          style={{ strokeDasharray: path.strokeColor === '#9CA3AF' ? '8 4' : 'none' }}
                        />
                      );
                    })}
                  </AnimatePresence>
                </svg>

                {/* Tiers Container */}
                {!cycleError && (
                  <div className="relative z-10 flex flex-col justify-end min-h-full gap-16 md:gap-24 w-full">
                    {/* Reverse mapping so Level N (Ultimate) is at top, Level 0 (Base) is at bottom */}
                    {[...tiers].reverse().map((tier, reverseIndex) => {
                      const actualLevel = maxLevel - reverseIndex;
                      return (
                        <div
                          key={actualLevel}
                          className="flex flex-row items-center justify-center gap-6 md:gap-12 relative"
                        >
                          {/* Tier Label */}
                          <div className="absolute -left-12 md:-left-24 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-black uppercase text-gray-400 tracking-widest pointer-events-none">
                            Tier {actualLevel}
                          </div>

                          {tier.map((node) => {
                            let bgColor = 'bg-gray-100';
                            let borderColor = 'border-gray-300';
                            let icon = <Lock className="w-4 h-4 text-gray-400" />;
                            let shadow = 'shadow-none';

                            if (node.status === 'in-progress') {
                              bgColor = 'bg-blue-50';
                              borderColor = 'border-blue-500';
                              icon = <Circle className="w-4 h-4 text-blue-500 fill-blue-500/20" />;
                              shadow = 'shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]';
                            } else if (node.status === 'unlocked') {
                              bgColor = 'bg-[#FFDE59]';
                              borderColor = 'border-black';
                              icon = <CheckCircle2 className="w-5 h-5 text-black fill-white" />;
                              shadow = 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
                            }

                            let CategoryIcon = Star;
                            if (node.category === 'milestone') CategoryIcon = Flag;
                            if (node.category === 'asset') CategoryIcon = Database;

                            return (
                              <motion.div
                                layout
                                key={node.id}
                                ref={(el) => (nodeRefs.current[node.id] = el)}
                                onClick={() => cycleStatus(node.id)}
                                className={`relative p-4 md:p-5 w-48 md:w-64 border-4 ${borderColor} ${bgColor} ${shadow} cursor-pointer transition-all hover:-translate-y-1 flex flex-col`}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <CategoryIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="text-xs md:text-sm font-black uppercase leading-tight line-clamp-2">
                                      {node.title}
                                    </span>
                                  </div>
                                  <div className="shrink-0 ml-2">{icon}</div>
                                </div>

                                {node.effort && (
                                  <div className="mt-2 inline-block bg-black text-white text-[10px] font-bold px-2 py-1 uppercase self-start">
                                    {node.effort}
                                  </div>
                                )}

                                {node.desc && (
                                  <div className="mt-3 text-xs font-medium text-gray-700 line-clamp-3">{node.desc}</div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Modal isOpen={!!pendingPreset} onClose={() => setPendingPreset(null)} title="Are you sure?">
        <p className="mb-6 font-medium text-gray-700">
          This will completely wipe your current skill tree and replace it with the selected preset. Any unsaved
          progress will be lost.
        </p>
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-red-400 hover:bg-red-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold py-3"
            onClick={() => {
              if (pendingPreset && PRESETS[pendingPreset]) {
                setNodes(PRESETS[pendingPreset].nodes);
              }
              setPendingPreset(null);
            }}
          >
            Yes, Wipe It
          </Button>
          <Button
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold py-3"
            onClick={() => setPendingPreset(null)}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      <Footer>
        <p className="text-gray-600 font-medium text-sm">
          <strong>The brutal reality of capacity:</strong> You cannot skip to the top tier without fulfilling the base
          prerequisites. Serialize your focus.
        </p>
      </Footer>
    </div>
  );
}
