/**
 * Analyzes a list of nodes and assigns each a depth level based on prerequisites.
 * Uses Kahn's algorithm for topological sorting to also detect circular dependencies.
 *
 * @param {Array} nodes - Array of node objects: { id, prereqs: [id1, id2] }
 * @returns {Object} { levels: { id: levelNumber }, maxLevel: number }
 * @throws {Error} If a circular dependency is detected.
 */
export function calculateNodeLevels(nodes) {
  if (!nodes || nodes.length === 0) return { levels: {}, maxLevel: 0, tiers: [] };

  const inDegree = {};
  const adjList = {};
  const levels = {};

  // Initialize
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
    levels[n.id] = 0;
  });

  // Build Graph
  nodes.forEach((n) => {
    const prereqs = n.prereqs || [];
    prereqs.forEach((prereqId) => {
      // Only count prereqs that actually exist in the nodes list
      if (inDegree[prereqId] !== undefined) {
        adjList[prereqId].push(n.id);
        inDegree[n.id]++;
      }
    });
  });

  // Find nodes with 0 in-degree (Base Skills)
  const queue = [];
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  });

  let processedCount = 0;
  let maxLevel = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    processedCount++;

    const currentLevel = levels[current];
    maxLevel = Math.max(maxLevel, currentLevel);

    adjList[current].forEach((dependentId) => {
      levels[dependentId] = Math.max(levels[dependentId], currentLevel + 1);
      inDegree[dependentId]--;
      if (inDegree[dependentId] === 0) {
        queue.push(dependentId);
      }
    });
  }

  if (processedCount !== nodes.length) {
    throw new Error('Circular dependency detected in the skill tree.');
  }

  // Group by tiers for easy rendering
  const tiers = [];
  for (let i = 0; i <= maxLevel; i++) {
    tiers.push(nodes.filter((n) => levels[n.id] === i));
  }

  return { levels, maxLevel, tiers };
}
