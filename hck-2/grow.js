/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  while (ns.getRunningScript('hack.js', target)) {
    ns.sleep(100)
  }

  await ns.grow(target)
}