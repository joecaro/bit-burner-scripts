import { runWeakenScript, runGrowScript } from 'utils.js'
/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const allocatedRAM = ns.args[1];

  try {
    while (!isServerPrepped(ns, target)) {
      const growThreads = calculateGrowThreadsToMax(ns, target, allocatedRAM);

      const weakenThreadsToMin = calculateWeakenThreadsToMin(ns, target);

      const securityIncreaseFromGrow = growThreads * 0.004;
      const weakenThreadsForGrow = Math.ceil(securityIncreaseFromGrow / 0.05);

      // Total weaken threads
      const totalWeakenThreads = weakenThreadsForGrow + weakenThreadsToMin;

      const growTime = ns.getGrowTime(target);
      const weakenTime = ns.getWeakenTime(target);
      const growDelay = Math.max(0, weakenTime - growTime);
      const weakenDelay = 0; // Start weaken scripts immediately

      // Run weaken scripts
      await runWeakenScript(ns, target, totalWeakenThreads, weakenDelay);

      // Run grow scripts with calculated delay
      await runGrowScript(ns, target, growThreads, growDelay);

      // Wait for weaken operation to complete
      await ns.sleep(weakenTime + 500); // Add a buffer of 500ms
    }


    if (target && allocatedRAM) {
      const pid = ns.run('batch_executor.js', 1, target, allocatedRAM);
      if (pid === 0) {
        ns.tprint(`Failed to start batch_executor.js for ${target}`);
      }
    } else {
      ns.tprint(`Invalid arguments: target = ${target}, allocatedRAM = ${allocatedRAM}`);
    }
  } catch (e) {
    console.error(e)
    ns.tprint(e)
    ns.toast(e, 'error')
  }
}

export function isServerPrepped(ns, target) {
  return (
    ns.getServerSecurityLevel(target) <= ns.getServerMinSecurityLevel(target) + 0.5 &&
    ns.getServerMoneyAvailable(target) >= ns.getServerMaxMoney(target) * 0.95
  );
}

function securityAboveMinimum(ns, target) {
  return ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 0.5;
}

function moneyBelowMaximum(ns, target) {
  return ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) * 0.99;
}

/**
 * @param {NS} ns
 * @param {string} target
*/
function calculateWeakenThreadsToMin(ns, target) {
  const securityDiff = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);

  if (!securityDiff) {
    return 0
  }
  const weakenEffect = ns.weakenAnalyze(1);
  const idealWeakenThreads = Math.ceil(securityDiff / weakenEffect);

  const scriptRam = ns.getScriptRam('weaken.js');
  const maxThreads = Math.floor(getTotalAvailableRAM(ns) / scriptRam);


  const weakenThreads = Math.min(idealWeakenThreads, maxThreads);

  // Ensure at least 1 thread
  return weakenThreads
}

/**
 * @param {NS} ns
 * @param {string} target
 * @param {number} allocatedRam
*/
function calculateGrowThreadsToMax(ns, target, allocatedRAM) {
  const moneyAvailable = Math.max(ns.getServerMoneyAvailable(target), 1);
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyNeeded = maxMoney - moneyAvailable;

  if (!moneyNeeded) {
    return 0;
  }

  const idealGrowThreads = Math.ceil(ns.growthAnalyze(target, moneyNeeded));

  const scriptRam = ns.getScriptRam('grow.js');
  const maxThreads = Math.floor(allocatedRAM / scriptRam);

  // Use the lesser of the ideal threads and the max threads
  const growThreads = Math.min(idealGrowThreads, maxThreads);

  return growThreads
}

function getTotalAvailableRAM(ns) {
  let totalAvailableRAM = 0;
  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    const maxRAM = ns.getServerMaxRam(server);
    const usedRAM = ns.getServerUsedRam(server);
    totalAvailableRAM += maxRAM - usedRAM;
  }

  return totalAvailableRAM;
}