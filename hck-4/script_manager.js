/** @param {NS} ns **/
export async function main(ns) {
  const targetServer = ns.args[0];
  const attackingServer = ns.args[1];
  
  while (true) {
    const totalRam = ns.getServerMaxRam(attackingServer);
    const usedRam = ns.getServerUsedRam(attackingServer);
    const availableRam = totalRam - usedRam;
    const ENOUGH_RAM = availableRam >= 3.5

    if (ENOUGH_RAM) {
      const shouldWeaken = ns.getServerSecurityLevel(targetServer) > ns.getServerMinSecurityLevel(targetServer)
      const shouldGrow = ns.getServerMoneyAvailable(targetServer) < ns.getServerMaxMoney(targetServer)
      
      if (shouldWeaken || shouldGrow) {
        const availableThreads = Math.floor(availableRam / 1.75); // Assume each script takes 1.75GB of RAM
        const growThreads = shouldGrow && shouldWeaken ? availableThreads / 2 : shouldGrow ? availableThreads : 0
        const weakenThreads = shouldGrow && shouldWeaken ? availableThreads / 2 : shouldWeaken ? availableThreads : 0

        for (let i = 0; i <= growThreads; i++) {
          ns.exec('grow.js', attackingServer, 1, targetServer);
        }
        for (let i = 0; i <= weakenThreads; i++) {
          ns.exec('weaken.js', attackingServer, 1, targetServer);
        }
      } else {
        ns.exec('hack.js', attackingServer, 1, targetServer);
        ns.exec('hack.js', attackingServer, 1, targetServer);
      }
    } else {
      ns.print("NOT ENOUGH RAM")
    }

    await ns.sleep(1000)
  }
}