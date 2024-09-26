/** @param {NS} ns 
 * @param {string} target */
function findFile(ns, target, fileString) {
  const files = ns.ls(target);
  for (const file of files) {
    if (file.toLowerCase().includes(fileString.toLowerCase())) {
      ns.tprint("----------")
      ns.tprint(`${target} has file! - ${file}`)
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  const fileString = ns.args[0]


  const depth = Number(ns.args[1]) || 1;

  if (!fileString) {
    ns.tprint("Provide a file string to search for");
    return;
  }
  if (isNaN(depth)) {
    ns.tprint("depth must be a number");
    return;
  }

  let currentDepth = 0;
  let currentTargets = ['home'];
  let nextTargets = [];
  const processedServers = new Set(); // To track processed servers

  while (currentDepth <= depth) {
    ns.tprint(`working on depth ${currentDepth} out of ${depth}`);
    for (let i = 0; i < currentTargets.length; i++) {
      const currentTargetServer = currentTargets[i];

      if (processedServers.has(currentTargetServer)) continue; // Skip already processed servers
      processedServers.add(currentTargetServer); // Mark as processed

      findFile(ns, currentTargetServer, fileString)

      let neighbors = ns.scan(currentTargets[i]);
      nextTargets = nextTargets.concat(neighbors);
    }

    currentTargets = nextTargets;
    nextTargets = [];
    currentDepth++;
    await ns.sleep(10);
  }
}