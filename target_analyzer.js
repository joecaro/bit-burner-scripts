const AMOUNT_OF_TARGETS = 50;

/** @param {NS} ns **/
export function getTargets(ns) {
  const servers = scanAllServers(ns);
  const targets = [];

  for (const server of servers) {
    if (isValidTarget(ns, server)) {
      const targetInfo = evaluateServer(ns, server);
      targets.push(targetInfo);
    }
  }

  targets.sort((a, b) => b.priority - a.priority);

  return targets.slice(0, AMOUNT_OF_TARGETS)
}

function scanAllServers(ns, host = 'home', visited = new Set()) {
  visited.add(host);
  let servers = [host];
  for (const neighbor of ns.scan(host)) {
    if (!visited.has(neighbor)) {
      servers = servers.concat(scanAllServers(ns, neighbor, visited));
    }
  }
  return servers;
}

function isValidTarget(ns, server) {
  return (
    ns.hasRootAccess(server) &&
    ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() &&
    ns.getServerMaxMoney(server) > 0
  );
}

/** 
 * @param {NS} ns 
 * @param {string} server
 **/
function evaluateServer(ns, server) {
  const minSecurity = ns.getServerMinSecurityLevel(server)
  const maxMoney = ns.getServerMaxMoney(server)
  const time = ns.getWeakenTime(server)

  const moneyPerTime = maxMoney / time;
  const chance = ns.hackAnalyzeChance(server)

  const priority = moneyPerTime * chance;

  return {
    name: server,
    maxMoney,
    minSecurity,
    priority,
    attacks: 0
  };
}