/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  while (ns.getRunningScript('grow.js', target)) {
    ns.sleep(100)
  }

  await ns.weaken(target)
}