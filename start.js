/** @param {NS} ns */
export async function main(ns) {
  ns.run('deploy_scripts.js')
  ns.run('home_orchestrator.js')
}