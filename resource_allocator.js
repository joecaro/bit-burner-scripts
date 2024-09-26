/** @param {NS} ns **/
export function allocateResources(ns, targets) {
  const totalRAM = getTotalAvailableRAM(ns);
  const totalPriority = targets.reduce((sum, target) => sum + target.priority, 0);

  console.log({ totalPriority, totalRAM, targets })

  const allocations = {};
  for (const target of targets) {
    const allocatedRAM = (target.priority / totalPriority) * totalRAM;
    allocations[target.name] = allocatedRAM;
  }

  return allocations;
}

function getTotalAvailableRAM(ns) {
  let totalRAM = 0;
  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    const serverMaxRAM = ns.getServerMaxRam(server);
    const serverUsedRAM = ns.getServerUsedRam(server);
    totalRAM += serverMaxRAM - serverUsedRAM;
  }

  return totalRAM;
}