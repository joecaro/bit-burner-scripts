/** @param {NS} ns */
export function getAvailableRam(ns, server) {
  const maxRam = ns.getServerMaxRam(server);
  const usedRam = ns.getServerUsedRam(server);
  return maxRam - usedRam;
}