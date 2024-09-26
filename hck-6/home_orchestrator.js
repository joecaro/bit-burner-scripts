const MONEY_THRESHOLD = .75;
const SECURITY_THRESHOLD = 1.2;

function toastProgress(ns, percent, title) {
  const value = Math.round(percent * 100);
  ns.toast(`${title}: ${Array(value).fill("=").join("")}${Array(100 - value).fill("_").join("")}`, 'info')
}

let lastToastTime = Date.now();

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  ns.run('distributor.js', 1, target);

  while (true) {
    const accessibleServers = JSON.parse(ns.read('network.txt'))

    const moneyPercent = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target);
    const targetServerNeedsGrow = moneyPercent < MONEY_THRESHOLD;
    const security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target);
    const targetServerNeedsWeaken = security > SECURITY_THRESHOLD;

    if (Date.now() - lastToastTime > 20000) {
      lastToastTime = Date.now();
      toastProgress(ns, moneyPercent, "Money")
      toastProgress(ns, 1 / security, "Security")
    }

    const mode = (
      targetServerNeedsWeaken
        ? "weaken"
        : targetServerNeedsGrow
          ? 'grow'
          : 'normal'
    );

    if (mode !== 'normal' && !ns.scriptRunning('prep_server.js', 'home')) {
      ns.run('prep_server.js', 1, target)
    }

    allocateThreads(ns, accessibleServers, target, mode)

    await ns.sleep(2000)
  }

}

/** @param {NS} ns 
 * @param {{ name: string, availableRam: number, maxRam: number  }[]} servers
 * @param {string} target
 * @param {'weaken' | 'grow' | 'normal'} mode*/
function allocateThreads(ns, servers, targetServer, mode) {
  const weakenTime = ns.getWeakenTime(targetServer);
  const growTime = ns.getGrowTime(targetServer);
  const hackTime = ns.getHackTime(targetServer);

  for (const server of servers) {
    if (server.maxRam > 0) {
      // Compute thread allocation based on the target's current stats
      const [hackThreads, growThreads, weakenThreads] = computeThreadAllocation(ns, server.maxRam, mode);

      try {
        // Write the allocation file on the server
        writeAllocationFile(ns, server.name, {
          hackThreads,
          growThreads,
          weakenThreads,
          weakenTime,
          growTime,
          hackTime
        });
      } catch {
        ns.tprint("ERROR ALLOCATING FILE")
      }

      const running = ns.getRunningScript('batch.js', server.name)

      if (!running) {
        addToQueue(ns, server.name)
      }
    }
  }
}

/** @param {NS} ns 
 * @param {number} maxRam
 * @param {'weaken' | 'grow' | 'normal'} mode*/
function computeThreadAllocation(ns, maxRam, mode) {
  // Define script RAM usage
  const weakenRam = ns.getScriptRam('weaken.js');
  const growRam = ns.getScriptRam('grow.js');
  const hackRam = ns.getScriptRam('hack.js');
  const batchRam = ns.getScriptRam('batch.js')
  const availableRam = maxRam - batchRam - hackRam;

  // Ratios for allocation depending on the mode
  const GROW_RATIO = mode === 'weaken' ? 0.6 : mode === 'grow' ? 0.9 : 0.8;
  const WEAKEN_RATIO = mode === 'weaken' ? 0.4 : mode === 'grow' ? 0.1 : 0.2;



  // Calculate total threads required for each task
  let weakenThreads = Math.floor(availableRam * WEAKEN_RATIO / weakenRam);
  let growThreads = Math.floor(availableRam * GROW_RATIO / growRam);
  let hackThreads = mode === 'normal' ? 1 : 0;

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
  return [hackThreads, growThreads, weakenThreads];
}

/** @param {NS} ns 
 * @param {string} server
 * @param {{}} data*/
function writeAllocationFile(ns, server, data) {
  const fileName = `/tmp/allocations_${server}.txt`;
  ns.write(fileName, JSON.stringify(data), "w");
}

/** @param {NS} ns 
 *  @param {string} server */
function addToQueue(ns, server) {
  try {
    const queue = [...JSON.parse(ns.read('queue.txt'))];
    if (!queue.includes(server)) {
      queue.push(server)
    }
    ns.write('queue.txt', JSON.stringify(queue), 'w')
  } catch (e) {
    ns.tprint(`Error parsing queue file: ${e.message}`);
    ns.tprint(ns.read('queue.txt'));
  }
}