/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const weaken1Start = ns.args[1];
  const weaken2Start = ns.args[2];
  const growStart = ns.args[3];
  const hackStart = ns.args[4];
  const weakenThreads1 = ns.args[5];
  const weakenThreads2 = ns.args[6];
  const growThreads = ns.args[7];
  const hackThreads = ns.args[8];
  const divisor = ns.args[9];


  // Step 1: Start Weaken 1 (longest operation)
  ns.run("weaken.js", Math.floor(weakenThreads1 / divisor), target);
  await ns.sleep(weaken2Start - weaken1Start); // Sleep until Weaken 2 should start

  // Step 2: Start Weaken 2
  ns.run("weaken.js", Math.floor(weakenThreads2 / divisor), target);
  await ns.sleep(growStart - weaken2Start); // Sleep until Grow should start

  // Step 3: Start Grow
  ns.run("grow.js", Math.floor(growThreads / divisor), target);
  await ns.sleep(hackStart - growStart); // Sleep until Hack should start

  // Step 4: Start Hack
  ns.run("hack.js", Math.floor(hackThreads / divisor), target);
}