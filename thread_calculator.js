// thread_calculator.js

/** @param {NS} ns **/
export function calculateThreads(ns, targetName, allocatedRAM) {
  const securityIncreasePerHackThread = 0.002;
  const securityIncreasePerGrowThread = 0.004;
  const serverMoney = ns.getServerMoneyAvailable(targetName)
  const weakenEffect = ns.weakenAnalyze(1);

  // Desired percentage to hack (e.g., 10%)
  const desiredHackPercent = 0.2;

  // Calculate hack threads
  let hackThreads = Math.floor(ns.hackAnalyzeThreads(targetName, serverMoney * desiredHackPercent));

  // Calculate security increase due to hack
  const hackSecurityIncrease = hackThreads * securityIncreasePerHackThread;

  // Calculate weaken threads to offset hack security increase
  let weakenThreads1 = Math.ceil(hackSecurityIncrease / weakenEffect);

  // Calculate grow threads to recover money after hack
  const growMultiplier = 1 / (1 - desiredHackPercent);
  let growThreads = Math.ceil(ns.growthAnalyze(targetName, growMultiplier));

  // Calculate security increase due to grow
  const growSecurityIncrease = growThreads * securityIncreasePerGrowThread;

  // Calculate weaken threads to offset grow security increase
  let weakenThreads2 = Math.ceil(growSecurityIncrease / weakenEffect);

  // Adjust threads if exceeding allocated RAM
  const totalRAMNeeded = calculateTotalRAM(ns, hackThreads, growThreads, weakenThreads1, weakenThreads2);

  if (totalRAMNeeded > allocatedRAM) {
    const scale = allocatedRAM / totalRAMNeeded;
    return {
      hack: Math.floor(hackThreads * scale),
      grow: Math.floor(growThreads * scale),
      weaken1: Math.floor(weakenThreads1 * scale),
      weaken2: Math.floor(weakenThreads2 * scale),
    };
  }

  hackThreads = Math.max(hackThreads, 1);
  growThreads = Math.max(growThreads, 1);
  weakenThreads1 = Math.max(weakenThreads1, 1);
  weakenThreads2 = Math.max(weakenThreads2, 1);

  return {
    hack: hackThreads,
    grow: growThreads,
    weaken1: weakenThreads1,
    weaken2: weakenThreads2,
  };
}

function calculateTotalRAM(ns, hackThreads, growThreads, weakenThreads1, weakenThreads2) {
  const hackRAM = ns.getScriptRam('hack.js');
  const growRAM = ns.getScriptRam('grow.js');
  const weakenRAM = ns.getScriptRam('weaken.js');

  return (
    hackThreads * hackRAM +
    growThreads * growRAM +
    (weakenThreads1 + weakenThreads2) * weakenRAM
  );
}