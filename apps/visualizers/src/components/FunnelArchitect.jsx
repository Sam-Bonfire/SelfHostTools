import { resetPersistedState, usePersistedState } from '@packages/persistence';
import {
  Button,
  CalculatorHeader,
  CalculatorLayout,
  Card,
  Input,
  Modal,
  ResultsAnalysis,
  Select
} from '@packages/styling';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { calculateLines, debounce } from '../lib/funnelLogic';
import { FUNNEL_PRESETS } from '../lib/funnelPresets';

function NodeForm({ node, isEditing, onUpdate, onDelete, onAdd, onCancel, availableTargets }) {
  return (
    <div className="space-y-4">
      <Input
        id={isEditing ? 'edit-title' : 'new-title'}
        label="Title"
        value={node.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
      <Input
        id={isEditing ? 'edit-stage' : 'new-stage'}
        label="Stage Name (Use prefix to sort, e.g. '1. Traffic')"
        value={node.stage || ''}
        onChange={(e) => onUpdate({ stage: e.target.value })}
      />
      {isEditing && (
        <>
          <Input
            id="edit-metrics"
            label="Metrics (e.g. '10% CTR')"
            value={node.metrics || ''}
            onChange={(e) => onUpdate({ metrics: e.target.value })}
          />
          <Input
            id="edit-desc"
            label="Description"
            value={node.desc || ''}
            onChange={(e) => onUpdate({ desc: e.target.value })}
          />
          <Select
            id="edit-targets"
            label="Feeds Into (Targets)"
            multiple
            value={node.targets || []}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, (option) => option.value);
              onUpdate({ targets: options });
            }}
            options={availableTargets}
          />
        </>
      )}

      {isEditing ? (
        <div className="flex space-x-2 pt-2">
          <Button className="flex-1" onClick={onCancel}>
            Done
          </Button>
          <Button variant="destructive" className="flex items-center justify-center" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          className="w-full flex items-center justify-center"
          onClick={onAdd}
          disabled={!node.title || !node.stage}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Node
        </Button>
      )}
    </div>
  );
}

export default function FunnelArchitect() {
  const [nodes, setNodes] = usePersistedState('FunnelArchitect', 'nodes', FUNNEL_PRESETS['b2b-saas'].nodes);
  const [selectedPreset, setSelectedPreset] = useState('b2b-saas');
  const [pendingPreset, setPendingPreset] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);

  const [newNode, setNewNode] = useState({
    title: '',
    stage: '',
    metrics: '',
    desc: '',
    targets: []
  });

  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const [lines, setLines] = useState([]);

  // Get sorted unique stages
  const stages = useMemo(() => {
    return [...new Set(nodes.map((n) => n.stage))].sort();
  }, [nodes]);

  // Group nodes by stage
  const nodesByStage = useMemo(() => {
    const grouped = {};
    stages.forEach((s) => {
      grouped[s] = [];
    });
    nodes.forEach((n) => {
      grouped[n.stage].push(n);
    });
    return grouped;
  }, [nodes, stages]);

  const handleAddNode = () => {
    if (!newNode.title || !newNode.stage) return;
    const id = crypto.randomUUID();
    setNodes([...nodes, { ...newNode, id }]);
    setNewNode({ title: '', stage: '', metrics: '', desc: '', targets: [] });
  };

  const handleUpdateNode = (id, updates) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const handleDeleteNode = (id) => {
    setNodes(
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          targets: n.targets.filter((t) => t !== id)
        }))
    );
    if (editingNodeId === id) setEditingNodeId(null);
  };

  const confirmLoadPreset = () => {
    if (pendingPreset && FUNNEL_PRESETS[pendingPreset]) {
      setNodes(FUNNEL_PRESETS[pendingPreset].nodes);
      setSelectedPreset(pendingPreset);
      setEditingNodeId(null);
    }
    setPendingPreset(null);
  };

  const drawLines = () => {
    const newLines = calculateLines({
      nodes,
      stages,
      nodesByStage,
      nodeRefs,
      canvasRef
    });
    setLines(newLines);
  };

  useEffect(() => {
    const debouncedDrawLines = debounce(drawLines, 50);
    const timer = setTimeout(() => {
      drawLines();
    }, 50);

    window.addEventListener('resize', debouncedDrawLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', debouncedDrawLines);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, stages]);

  const STAGE_COLORS = [
    'border-blue-400',
    'border-purple-400',
    'border-green-400',
    'border-yellow-400',
    'border-red-400',
    'border-cyan-400',
    'border-orange-400'
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black p-4 md:p-8 font-sans">
      <CalculatorLayout>
        <div className="lg:col-span-12">
          <CalculatorHeader
            namespace="FunnelArchitect"
            icon={Filter}
            title="Funnel & Flow Architect"
            description="Design top-down conversion funnels, map user journeys, and visualize ecosystem workflows."
            onReset={() => {
              resetPersistedState('FunnelArchitect');
            }}
          />
        </div>

        {/* LEFT PANEL: CONTROLS */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card bodyClassName="p-4 space-y-4">
            <h3 className="font-bold text-lg border-b-2 border-black pb-2">Presets</h3>
            <div className="flex flex-col">
              <label
                className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black"
                htmlFor="presetSelect"
              >
                Select Template
              </label>
              <div className="flex space-x-2">
                <Select
                  id="presetSelect"
                  value={selectedPreset}
                  onChange={(e) => {
                    if (e.target.value !== selectedPreset) {
                      setPendingPreset(e.target.value || 'blank');
                    }
                  }}
                  className="w-full"
                >
                  <option value="">Custom (Blank)</option>
                  {Object.keys(FUNNEL_PRESETS).map((key) => (
                    <option key={key} value={key}>
                      {FUNNEL_PRESETS[key].name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {selectedPreset && (
              <p className="text-sm text-gray-600 bg-yellow-100 p-2 border-2 border-black">
                {FUNNEL_PRESETS[selectedPreset].description}
              </p>
            )}
            <Button onClick={() => setNodes([])} variant="destructive" className="w-full">
              Clear Canvas
            </Button>
          </Card>

          <Card bodyClassName="p-4 space-y-4">
            <h3 className="font-bold text-lg border-b-2 border-black pb-2">
              {editingNodeId ? 'Edit Node' : 'Add Node'}
            </h3>

            {editingNodeId ? (
              (() => {
                const node = nodes.find((n) => n.id === editingNodeId);
                if (!node) return null;
                const availableTargets = nodes
                  .filter((n) => n.id !== node.id)
                  .map((n) => ({ value: n.id, label: n.title }));

                return (
                  <NodeForm
                    node={node}
                    isEditing={true}
                    onUpdate={(updates) => handleUpdateNode(node.id, updates)}
                    onDelete={() => handleDeleteNode(node.id)}
                    onCancel={() => setEditingNodeId(null)}
                    availableTargets={availableTargets}
                  />
                );
              })()
            ) : (
              <NodeForm
                node={newNode}
                isEditing={false}
                onUpdate={(updates) => setNewNode({ ...newNode, ...updates })}
                onAdd={handleAddNode}
              />
            )}
          </Card>
        </div>

        {/* RIGHT PANEL: CANVAS */}
        <div className="lg:col-span-12 xl:col-span-8">
          <ResultsAnalysis>
            <div className="relative w-full overflow-x-auto overflow-y-hidden shadow-[inset_0px_0px_20px_rgba(0,0,0,0.05)] bg-[#FDFBF7] border-4 border-black">
              <div
                ref={canvasRef}
                className="relative min-h-[800px] w-max min-w-full mx-auto p-8 md:p-12 flex flex-col items-center"
                style={{
                  backgroundImage: 'radial-gradient(#E5E7EB 2px, transparent 2px)',
                  backgroundSize: '30px 30px'
                }}
              >
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 mix-blend-multiply"
                  style={{ minWidth: '100%', minHeight: '100%' }}
                >
                  <defs>
                    <marker id="arrowhead-funnel" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                    </marker>
                  </defs>
                  <AnimatePresence>
                    {lines.map((line) => (
                      <motion.path
                        key={line.id}
                        d={line.d}
                        fill="none"
                        stroke={line.color}
                        strokeWidth="3"
                        markerEnd="url(#arrowhead-funnel)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    ))}
                  </AnimatePresence>
                </svg>

                <div className="relative z-20 flex flex-col items-center space-y-16 min-w-max pb-32">
                  {stages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20 font-bold text-xl">
                      No nodes added. Load a preset or create your own.
                    </div>
                  )}

                  {stages.map((stageName, stageIndex) => {
                    const colorClass = STAGE_COLORS[stageIndex % STAGE_COLORS.length];

                    return (
                      <div key={stageName} className="flex flex-col items-center w-full">
                        <div className="mb-4 bg-black text-white px-4 py-1 font-bold text-sm tracking-widest uppercase">
                          {stageName}
                        </div>

                        <div className="flex flex-row gap-8 justify-center w-full px-8">
                          {nodesByStage[stageName].map((node) => (
                            <div
                              key={node.id}
                              ref={(el) => (nodeRefs.current[node.id] = el)}
                              onClick={() => setEditingNodeId(node.id)}
                              className={`w-64 bg-white border-4 ${colorClass} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 cursor-pointer hover:-translate-y-1 transition-transform relative`}
                            >
                              <h4 className="font-bold text-lg mb-1 leading-tight">{node.title}</h4>
                              {node.metrics && (
                                <div className="inline-block bg-green-200 border-2 border-black text-xs px-2 py-0.5 font-bold mb-2">
                                  {node.metrics}
                                </div>
                              )}
                              {node.desc && (
                                <p className="text-sm text-gray-600 line-clamp-2 leading-snug">{node.desc}</p>
                              )}

                              {editingNodeId === node.id && (
                                <div className="absolute -top-3 -right-3 bg-yellow-400 border-2 border-black w-6 h-6 flex items-center justify-center font-bold text-xl animate-bounce">
                                  *
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ResultsAnalysis>
        </div>
      </CalculatorLayout>

      <Modal
        isOpen={!!pendingPreset}
        onClose={() => setPendingPreset(null)}
        title={pendingPreset === 'blank' ? 'Clear Canvas?' : 'Load Preset?'}
      >
        <p>
          {pendingPreset === 'blank' ? (
            'Are you sure you want to clear the canvas and start fresh?'
          ) : (
            <>
              Are you sure you want to load the <strong>{pendingPreset && FUNNEL_PRESETS[pendingPreset]?.name}</strong>{' '}
              preset?
            </>
          )}
        </p>
        <p className="text-red-600 font-bold mt-2 mb-6">This will wipe your current funnel.</p>
        <div className="flex gap-4">
          <Button className="flex-1 bg-red-400 hover:bg-red-500 font-bold py-3" onClick={confirmLoadPreset}>
            Yes, overwrite canvas
          </Button>
          <Button
            className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-3"
            onClick={() => setPendingPreset(null)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
