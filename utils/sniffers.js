/** @param {NS} ns 
 * @param {string} target */
export function determineHackability(ns, target) {
  const money = ns.getServerMaxMoney(target)
  const time = ns.getWeakenTime(target)

  const moneyPerTime = money / time;

  return moneyPerTime;
}

/** @param {NS} ns 
 * @param {string} attackingServer */
export function canWeAttack(ns, attackingServer) {
  const numPortsRequired = ns.getServerNumPortsRequired(attackingServer);
  const numPortsAble = (
    ns.fileExists("BruteSSH.exe", "home") ? 1 : 0
  ) + (
      ns.fileExists("FTPCrack.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("relaySMTP.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("SQLInject.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("HTTPWorm.exe", "home") ? 1 : 0
    )

  const hackingRequired = ns.getServerRequiredHackingLevel(attackingServer);
  const hackingLevel = ns.getHackingLevel();

  const isHome = attackingServer === 'home' || attackingServer.includes('pserv');
  const iCanTakeServer = numPortsAble >= numPortsRequired && hackingLevel >= hackingRequired;

  // do not attack if we can't
  if ((!isHome) && (!iCanTakeServer)) {
    ns.print(`could not attack ${attackingServer}. Needed ${numPortsRequired} ports and only can get ${numPortsAble}. Needed ${hackingRequired}lv and only had ${hackingLevel}`);
    return false;
  }

  return true;
}

const BLACKLISTED_SERVERS = ['darkweb']

/** @param {NS} ns 
 * @param {number} depth
 * @returns {[string[], string[]]} return
 */
export function getAccessibleServers(ns, depth = 1) {
  let currentDepth = 0;
  let currentTargets = ['home'];
  let nextTargets = [];
  const processedServers = new Set(); // To track processed servers
  const accessedServers = [];
  const inaccessibleServers = [];

  while (currentDepth <= depth) {
    for (let i = 0; i < currentTargets.length; i++) {
      const currentTargetServer = currentTargets[i];

      if (processedServers.has(currentTargetServer) | BLACKLISTED_SERVERS.includes(currentTargetServer)) continue; // Skip already processed servers or blacklisted servers
      processedServers.add(currentTargetServer); // Mark as processed

      if (!canWeAttack(ns, currentTargetServer)) {
        inaccessibleServers.push(currentTargetServer)
        continue;
      }


      const isHome = currentTargetServer === 'home';

      if (!isHome) {
        // OPEN DOORS
        if (ns.fileExists("BruteSSH.exe", "home")) {
          ns.brutessh(currentTargetServer);
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
          ns.ftpcrack(currentTargetServer);
        }
        if (ns.fileExists("relaySMTP.exe", "home")) {
          ns.relaysmtp(currentTargetServer);
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
          ns.sqlinject(currentTargetServer);
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
          ns.httpworm(currentTargetServer);
        }
        ns.nuke(currentTargetServer);

        accessedServers.push(currentTargetServer);
      }

      let neighbors = ns.scan(currentTargets[i]);
      nextTargets = nextTargets.concat(neighbors);
    }

    currentTargets = nextTargets;
    nextTargets = [];
    currentDepth++;
  }

  return [accessedServers, inaccessibleServers];
}

/** @param {NS} ns 
 * @param {string} serverName */
export function getServerInfo(ns, serverName) {
  const maxRam = ns.getServerMaxRam(serverName)
  const usedRam = ns.getServerUsedRam(serverName);
  const availableRam = maxRam - usedRam;

  return { name: serverName, maxRam, availableRam }
}