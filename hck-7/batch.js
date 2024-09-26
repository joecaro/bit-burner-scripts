import { SCRIPT_OFFSET } from './constants'
/** @param {NS} ns */

export async function main(ns) {
  const target = ns.args[0]
  const growThreads = ns.args[1]
  const weakenThreads = ns.args[2]
  const growTime = ns.args[3]
  const weakenTime = ns.args[4]

  const growRam = ns.getScriptRam('grow.js')
  const totalGrowRam = growRam * growThreads;
  const weakenRam = ns.getScriptRam('weaken.js')
  const totalWeakenRam = weakenRam * weakenThreads;

  const host = ns.getHostname()
  const maxRam = ns.getServerMaxRam(host)


  const unusedRam = () => {
    const availableRam = maxRam - ns.getServerUsedRam(host);
    return availableRam - totalGrowRam - totalWeakenRam
  }

  while (unusedRam() < maxRam * .2) {
    const weakenDelay = weakenTime - SCRIPT_OFFSET - growTime;

    ns.exec('update_node_stats.js', 'home', 1, ns.getHostname(), weakenTime)
    weakenThreads && ns.run('weaken.js', weakenThreads, target)
    await ns.sleep(weakenDelay)
    growThreads && ns.run('grow.js', growThreads, target)
    await ns.sleep(weakenTime - weakenDelay)
  }
}