import { updateState } from './utils/state.js';
import { getTargets } from './target_analyzer.js';
import { getNodes } from './node_analyzer.js';
import { allocateResources } from './resource_allocator.js';
import { startBatchManager } from './batch_manager.js';
import { monitorPerformance } from './performance_monitor.js';

/** @param {NS} ns **/
export async function main(ns) {
  const start = Date.now();

  const targets = getTargets(ns);
  const nodes = getNodes(ns)
  const allocations = allocateResources(ns, targets);

  // Update state with targets and allocations
  updateState(ns, prev => ({
    ...prev,
    allocations,
    nodes,
    targets
  }))

  const nodeNames = Object.keys(nodes)

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const node = nodeNames[i % nodeNames.length]
    ns.tprint(`run ${target.name} manager on ${node}`)
    allocations[target.name] && startBatchManager(ns, target, allocations[target.name], node);
  }

  // Continuous monitoring loop
  while (true) {
    // Start monitoring after 30s
    if (Date.now() - start > 30000) {
      await monitorPerformance(ns);
    }

    // Update stats in state
    updateState(ns, (prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        hackLevel: ns.getHackingLevel(),
        money: ns.getServerMoneyAvailable('home'),
      }
    }));

    await ns.sleep(5000); // Adjust sleep time as needed
  }
}