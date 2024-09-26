/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    ns.run('stats_gui.js')
    await ns.sleep(500)
  }
}