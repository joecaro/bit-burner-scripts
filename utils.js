/** @param {NS} ns **/
export async function runHackScript(ns, target, threads, delay) {
  const pid = ns.exec('hack.js', getServerWithRAM(ns, threads, 'hack.js'), threads, target, delay);
  if (pid === 0) {
    ns.tprint(`Failed to start hack.js on ${ns.getHostname()}. can't hack ${target}`);
  }

  return true;
}

/** @param {NS} ns **/
export async function runGrowScript(ns, target, totalThreads, delay) {
  if (!totalThreads) {
    return;
  }
  const scriptName = 'grow.js';
  const scriptRam = await ns.getScriptRam(scriptName);  // Await here
  let threadsToAllocate = totalThreads;

  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    let availableRAM = await ns.getServerMaxRam(server) - await ns.getServerUsedRam(server);  // Await RAM calls
    if (server === 'home') {
      availableRAM -= 100; // Reserve some RAM on home
    }
    const maxThreads = Math.floor(availableRAM / scriptRam);

    if (maxThreads > 0) {
      const threads = Math.min(threadsToAllocate, maxThreads);
      const pid = await ns.exec(scriptName, server, threads, target, delay);  // Await exec
      if (pid === 0) {
        ns.print(`Failed to start ${scriptName} on ${server}`);
      } else {
        ns.print(`Started ${scriptName} on ${server} with ${threads} threads and delay ${delay}`);
        threadsToAllocate -= threads;
      }

      if (threadsToAllocate <= 0) {
        break;
      }
    }
  }

  if (threadsToAllocate > 0) {
    ns.print(`Not enough RAM to run ${scriptName} with ${totalThreads} threads. ${threadsToAllocate} threads were not allocated.`);
  }

  return true;
}

/** @param {NS} ns **/
export async function runWeakenScript(ns, target, totalThreads, delay) {
  if (!totalThreads) {
    return;
  }
  const scriptName = 'weaken.js';
  const scriptRam = await ns.getScriptRam(scriptName);  // Await here
  let threadsToAllocate = totalThreads;

  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    let availableRAM = await ns.getServerMaxRam(server) - await ns.getServerUsedRam(server);  // Await RAM calls
    if (server === 'home') {
      availableRAM -= 100; // Reserve some RAM on home
    }
    const maxThreads = Math.floor(availableRAM / scriptRam);

    if (maxThreads > 0) {
      const threads = Math.min(threadsToAllocate, maxThreads);
      const pid = await ns.exec(scriptName, server, threads, target, delay);  // Await exec
      if (pid === 0) {
        ns.print(`Failed to start ${scriptName} on ${server}`);
      } else {
        ns.print(`Started ${scriptName} on ${server} with ${threads} threads and delay ${delay}`);
        threadsToAllocate -= threads;
      }

      if (threadsToAllocate <= 0) {
        break;
      }
    }
  }

  if (threadsToAllocate > 0) {
    ns.print(`Not enough RAM to run ${scriptName} with ${totalThreads} threads. ${threadsToAllocate} threads were not allocated.`);
  }

  return true;
}
function getServerWithRAM(ns, threads, scriptName) {
  const scriptRAM = ns.getScriptRam(scriptName);
  const requiredRAM = threads * scriptRAM;
  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    const availableRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    if (availableRAM >= requiredRAM) {
      return server;
    }
  }
  return 'home'; // Fallback to home if no server has enough RAM
}