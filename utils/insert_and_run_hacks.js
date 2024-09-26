import { getAvailableRam } from './ram_threads.js'

/** @param {NS} ns 
 * @param {string} attackingServer 
 * @param {string} hackee */
export default function insertAndRunHack(ns, attackingServer, hackee) {
  killAndCopyNewScripts();

  const availableRam = getAvailableRam();
  // RAM cost of each script
  const hackScriptRam = ns.getScriptRam('hack.js');
  const growScriptRam = ns.getScriptRam('grow.js');
  const weakenScriptRam = ns.getScriptRam('weaken.js');

  // If there's not enough RAM to even run 1 thread of each, exit
  if (availableRam < (hackScriptRam + growScriptRam + weakenScriptRam * 2)) {
    ns.tprint(`NOT ENOUGH RAM - ${attackingServer}`);
    return;
  }

  // Define hack percentage
  const hackPercent = 0.15; // Target to hack 15% of the server's money

  // Calculate thread requirements based on the hack percentage
  let hackThreads = Math.ceil(ns.hackAnalyzeThreads(hackee, ns.getServerMaxMoney(hackee) * hackPercent));
  let growThreads = Math.ceil(hackThreads * 2.5);
  let weakenThreads1 = Math.ceil(hackThreads * 0.2);
  let weakenThreads2 = Math.ceil(growThreads * 0.4);

  // Calculate total RAM usage for each script
  const hackRamUsage = hackThreads * hackScriptRam;
  const growRamUsage = growThreads * growScriptRam;
  const weakenRamUsage1 = weakenThreads1 * weakenScriptRam;
  const weakenRamUsage2 = weakenThreads2 * weakenScriptRam;

  // Total RAM needed for the batch
  let totalRamNeeded = hackRamUsage + growRamUsage + weakenRamUsage1 + weakenRamUsage2;

  // If total RAM needed exceeds available RAM, scale threads proportionally
  if (totalRamNeeded > availableRam) {
    scaleThreads()
  }

  const batches = Math.floor((availableRam - (ns.getScriptRam('batch.js') * 4)) / totalRamNeeded) > 0
    ? Math.floor((availableRam - (ns.getScriptRam('batch.js') * 4)) / totalRamNeeded) :
    1

  ns.tprint(availableRam)
  ns.tprint(totalRamNeeded)

  ns.exec('batch_script_manager.js', attackingServer, 1, hackee, hackThreads, growThreads, weakenThreads1, weakenThreads2, batches);

  function killAndCopyNewScripts() {
    // Kill any previously running scripts on the server
    ns.scriptKill('grow.js', attackingServer);
    ns.scriptKill('weaken.js', attackingServer);
    ns.scriptKill('hack.js', attackingServer);
    ns.scriptKill('batch.js', attackingServer);
    ns.scriptKill('batch_script_manager.js', attackingServer);

    ns.tprint(`Copying and running scripts at ${attackingServer}`);

    // Copy necessary scripts
    ns.scp('batch_script_manager.js', attackingServer);
    ns.scp('batch.js', attackingServer);
    ns.scp('grow.js', attackingServer);
    ns.scp('weaken.js', attackingServer);
    ns.scp('hack.js', attackingServer);
  }

  function scaleThreads() {
    const scaleFactor = availableRam / totalRamNeeded;

    hackThreads = Math.max(Math.floor(hackThreads * scaleFactor), 1);
    growThreads = Math.max(Math.floor(growThreads * scaleFactor), 1);
    weakenThreads1 = Math.max(Math.floor(weakenThreads1 * scaleFactor), 1);
    weakenThreads2 = Math.max(Math.floor(weakenThreads2 * scaleFactor), 1);

    // Recalculate total RAM usage after scaling
    const newHackRamUsage = hackThreads * hackScriptRam;
    const newGrowRamUsage = growThreads * growScriptRam;
    const newWeakenRamUsage1 = weakenThreads1 * weakenScriptRam;
    const newWeakenRamUsage2 = weakenThreads2 * weakenScriptRam;

    totalRamNeeded = newHackRamUsage + newGrowRamUsage + newWeakenRamUsage1 + newWeakenRamUsage2;

    // If the new total RAM still exceeds available RAM, scale down all threads again proportionally
    if (totalRamNeeded > availableRam) {
      growThreads = growThreads - 1;
    }

    ns.tprint(`Scaling threads down to fit available RAM: ${availableRam}GB`);
    ns.tprint(`Using: Hack: ${hackThreads}, Grow: ${growThreads}, Weaken1: ${weakenThreads1}, Weaken2: ${weakenThreads2}`);
  }
}