import insertAndRunHack from './utils/insert_and_run_hacks.js'

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
  const hackee = ns.args[0];

  if (!hackee) {
    ns.toast("ERROR: NO HACKEE PROVIDED")
    return;
  }

  if (!canWeAttack(ns, hackee)) {
    ns.toast("FAILURE IN ATTACK: CANNOT ATTACK " + hackee, 'error')
    return;
  }
  // Open Server Ports
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(hackee);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(hackee);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(hackee);
  }
  if (ns.fileExists("SQLInject.exe ", "home")) {
    ns.sqlinject(hackee);
  }
  if (ns.fileExists("HTTPWorm.exe ", "home")) {
    ns.httpworm(hackee);
  }


  // Get root access to hackee server
  ns.nuke(hackee);

  const depth = Number(ns.args[1]) || 1;

  if (isNaN(depth)) {
    ns.tprint("depth must be a number");
    return;
  }

  let currentDepth = 0;
  let currentTargets = ['home'];
  let nextTargets = [];
  const processedServers = new Set(); // To track processed servers

  while (currentDepth <= depth) {
    ns.tprint(`working on depth ${currentDepth}`);
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
      // ATTACK
      if (currentTargetServer !== "home") {
        insertAndRunHack(ns, currentTargetServer, hackee);
      }


      let neighbors = ns.scan(currentTargets[i]);
      nextTargets = nextTargets.concat(neighbors);
    }

    currentTargets = nextTargets;
    nextTargets = [];
    currentDepth++;
    await ns.sleep(10);
  }
}