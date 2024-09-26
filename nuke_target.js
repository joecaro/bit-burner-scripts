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
    ) + (
      ns.fileExists("SQLInject.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("HTTPWorm.exe", "home") ? 1 : 0
    )

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
  const targetServer = ns.args[0]

  if (!canWeAttack(ns, targetServer)) {

    return;
  }

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(targetServer);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(targetServer);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(targetServer);
  }
  if (ns.fileExists("SQLInject.exe ", "home")) {
    ns.sqlinject(targetServer);
  }
  if (ns.fileExists("HTTPWorm.exe ", "home")) {
    ns.httpworm(targetServer);
  }

  ns.nuke(targetServer);
}