/** @param {NS} ns 
 * @param {string} targetServer */
function insertAndRunHacks(ns, targetServer) {
  ns.scriptKill('grow.js', targetServer);
  ns.scriptKill('weaken.js', targetServer);
  ns.scriptKill('hack.js', targetServer);
  ns.scriptKill('script_manager.js', targetServer);
  ns.tprint(`copy and running at ${targetServer}`);

  ns.scp('script_manager.js', targetServer);
  ns.scp('grow.js', targetServer);
  ns.scp('weaken.js', targetServer);
  ns.scp('hack.js', targetServer);


  ns.exec('run_attack.js', 'home', 1, targetServer);
}

/** @param {NS} ns 
 * @param {string} targetServer */
function canWeAttack(ns, targetServer) {
  const numPortsRequired = ns.getServerNumPortsRequired(targetServer);
  const numPortsAble = (
    ns.fileExists("BruteSSH.exe", "home") ? 1 : 0
  ) + (
      ns.fileExists("FTPCrack.exe", "home") ? 1 : 0
    ) + (
      ns.fileExists("relaySMTP.exe", "home") ? 1 : 0
    );

  const hackingRequired = ns.getServerRequiredHackingLevel(targetServer);
  const hackingLevel = ns.getHackingLevel();

  const iOwnServer = targetServer === 'home' || targetServer.includes('pserv');
  const iCanTakeServer = numPortsAble >= numPortsRequired && hackingLevel >= hackingRequired;

  // do not attack if we can't
  if ((!iOwnServer) && (!iCanTakeServer)) {
    ns.tprint(`could not attack ${targetServer}. Needed ${numPortsRequired} ports and only can get ${numPortsAble}. Needed ${hackingRequired}lv and only had ${hackingLevel}`);
    return false;
  }

  return true;
}

/** @param {NS} ns */
export async function main(ns) {
  const depth = Number(ns.args[0]) || 1;

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
        insertAndRunHacks(ns, currentTargetServer);
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