/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  await new Promise((res) => {
    setTimeout(() => {
      ns.print("RUNNING... ", target)
    }, 100)
  })

  var moneyThresh = ns.getServerMaxMoney(target) * 0.75;

  var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }

  ns.nuke(target);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
    } else {
      // Otherwise, hack it
      await ns.hack(target);
    }
  }
}
