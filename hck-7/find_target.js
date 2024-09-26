import { updateState, readState } from "./utils/state.js";

/** @param {NS} ns 
 * @param {string} target */
function determineHackability(ns, target) {
  const money = ns.getServerMaxMoney(target)
  const time = ns.getWeakenTime(target)

  const moneyPerTime = money / time;
  const chance = ns.hackAnalyzeChance(target)

  const probableMoneyPerTime = moneyPerTime * chance;

  return probableMoneyPerTime;
}

/** @param {NS} ns 
 * @param {string} attackingServer */
function canWeAttack(ns, attackingServer) {
  const numPortsRequired = ns.getServerNumPortsRequired(attackingServer);
  const numPortsAble = (
    ns.fileExists("BruteSSH.exe", "home") ? 1 : 0
  ) + (
      ns.fileExists("FTPCrack.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("relaySMTP.exe", "home") ? 1 : 0
    );

  const hackingRequired = ns.getServerRequiredHackingLevel(attackingServer);
  const hackingLevel = ns.getHackingLevel();

  const iOwnServer = attackingServer === 'home' || attackingServer.includes('pserv');
  const iCanTakeServer = numPortsAble >= numPortsRequired && hackingLevel >= hackingRequired;

  // do not attack if we can't
  if ((!iOwnServer) && (!iCanTakeServer)) {
    ns.tprint(`could not attack ${attackingServer}. Needed ${numPortsRequired} ports and only can get ${numPortsAble}. Needed ${hackingRequired}lv and only had ${hackingLevel}`);
    return false;
  }

  return true;
}

/** @param {NS} ns */
export async function main(ns) {
  const state = readState(ns)
  const depth = Number(ns.args[0]) || 5;

  if (isNaN(depth)) {
    ns.tprint("depth must be a number");
    return;
  }

  let currentDepth = 0;
  let currentTargets = ['home'];
  let nextTargets = [];
  const processedServers = new Set(); // To track processed servers
  let bestTarget = '';
  let bestHackability = 0;

  while (currentDepth <= depth) {
    ns.tprint(`working on depth ${currentDepth} out of ${depth}`);
    for (let i = 0; i < currentTargets.length; i++) {
      const currentTargetServer = currentTargets[i];

      if (processedServers.has(currentTargetServer)) continue; // Skip already processed servers
      processedServers.add(currentTargetServer); // Mark as processed

      if (!canWeAttack(ns, currentTargetServer)) continue;


      const iOwnServer = currentTargetServer === 'home' || currentTargetServer.includes('pserv');

      if (!iOwnServer) {
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
        ns.nuke(currentTargetServer);
      }

      const hackability = determineHackability(ns, currentTargetServer);
      if (hackability > bestHackability) {
        bestTarget = currentTargetServer;
        bestHackability = hackability;
      }

      let neighbors = ns.scan(currentTargets[i]);
      nextTargets = nextTargets.concat(neighbors);
    }

    currentTargets = nextTargets;
    nextTargets = [];
    currentDepth++;
    await ns.sleep(10);
  }

  const maxMoney = ns.getServerMaxMoney(bestTarget)
  const minSecurity = ns.getServerMinSecurityLevel(bestTarget)
  const money = ns.getServerMoneyAvailable(bestTarget)
  const security = ns.getServerSecurityLevel(bestTarget)


  ns.tprint(`Best Target: ${bestTarget}. Hackability: ${bestHackability}`)

  updateState(ns, prev => ({
    ...prev,
    bestTarget: {
      name: bestTarget,
      maxMoney,
      money,
      minSecurity,
      security
    }
  }))
}