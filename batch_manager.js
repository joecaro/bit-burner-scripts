/** @param {NS} ns **/
export function startBatchManager(ns, target, allocatedRAM, node) {
  ns.exec('server_prep.js', node, 1, target.name, allocatedRAM);
}