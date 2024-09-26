import { getAccessibleServers, getServerInfo } from './utils/sniffers.js'
import { readState, updateState } from "./utils/state.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.run('find_target.js')
  await ns.sleep(500); // wait for best target
  const state = readState(ns);

  let currentNetworkDepth = 1;

  const processedServers = new Set();
  const runningBatches = new Map(); // Track running batches by server
  const badServers = new Set();

  while (true) {
    const [accessibleServers, inaccessibleServers] = getAccessibleServers(ns, currentNetworkDepth);
    if (inaccessibleServers.length === 0) {
      currentNetworkDepth++;
    }

    accessibleServers.forEach(server => {
      ns.scp('constants.js', server)
      ns.scp('batch.js', server)
      ns.scp('hack.js', server)
      ns.scp('grow.js', server)
      ns.scp('weaken.js', server)
    })


    const servers = accessibleServers.map(server => getServerInfo(ns, server));

    for (const server of servers) {
      // Skip if server has been processed or batch is already running
      if (!badServers.has(server.name) && !processedServers.has(server.name) && !runningBatches.has(server.name) && !ns.scriptRunning('batch.js', server.name)) {
        const badServer = allocateThreads(ns, server, state.target.name);
        if (badServer) {
          ns.tprint('bad server ', server.name)
          badServers.add(server.name)
          ns.run('update_node_stats.js', 1, server.name, 1, false)
        }
      }
    }

    // Check if any batches have finished
    for (const [server, pid] of runningBatches) {
      if (!ns.isRunning(pid, server)) {
        runningBatches.delete(server); // Remove finished batch from tracking
      }
    }

    updateState(ns, (prev) => {
      prev.badServers = badServers
    })

    await ns.sleep(2000);
  }

  /** @param {NS} ns 
   * @param {{ name: string, availableRam: number, maxRam: number  }} server
   * @param {string} target */
  function allocateThreads(ns, server, targetServer) {
    const weakenTime = ns.getWeakenTime(targetServer);
    const growTime = ns.getGrowTime(targetServer);
    if (server.maxRam > 0) {
      // Compute thread allocation based on the target's current stats
      const [growThreads, weakenThreads] = computeThreadAllocation(ns, server.maxRam);


      try {
        const pid = ns.exec('batch.js', server.name, 1, targetServer, growThreads, weakenThreads, weakenTime, growTime);
        if (pid !== 0) {
          runningBatches.set(server.name, pid); // Track the running batch by server
          processedServers.add(server.name);
        } else {
          ns.tprint(`ERROR: Failed to run batch.js on ${server.name}`);
          badServers.add(server.name)
          ns.run('update_node_stats.js', 1, server.name, 1, false)
        }
      } catch (e) {
      }
    }
  }
}


/** @param {NS} ns 
 * @param {number} maxRam */
function computeThreadAllocation(ns, maxRam) {
  // Define script RAM usage
  const weakenRam = ns.getScriptRam('weaken.js');
  const growRam = ns.getScriptRam('grow.js');
  const batchRam = ns.getScriptRam('batch.js')
  const availableRam = maxRam - batchRam;

  const GROW_RATIO = .95;
  const WEAKEN_RATIO = .05;

  // Calculate total threads required for each task
  let weakenThreads = Math.floor(availableRam * WEAKEN_RATIO / weakenRam);
  let growThreads = Math.floor(availableRam * GROW_RATIO / growRam);

  // Adjust thread allocation to ensure it fits within available RAM
  let totalRamRequired = (weakenThreads * weakenRam) + (growThreads * growRam);

  // If total RAM required exceeds available RAM, reduce threads
  while (totalRamRequired > availableRam) {
    if (growThreads > 0) {
      growThreads--; // Reduce grow threads next
    } else if (weakenThreads > 0) {
      weakenThreads--; // Reduce weaken threads last
    }

    // Recalculate total RAM required after adjustment
    totalRamRequired = (weakenThreads * weakenRam) + (growThreads * growRam);
  }

  // Return the thread allocation
  return [growThreads, weakenThreads];
}