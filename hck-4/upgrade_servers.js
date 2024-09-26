import copyAndRunHacks from './utils/insert_and_run_hacks.js'

/** @param {NS} ns */
export async function main(ns) {
  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  const ram = 32;

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    const hostname = "pserv-" + i;

    if (ns.getServerMaxRam(hostname) < ram) {
      const availableFunds = ns.getServerMoneyAvailable("home");
      const costToUpgrade = ns.getPurchasedServerUpgradeCost(hostname, ram)
      if (availableFunds > costToUpgrade) {
        const upgraded = ns.upgradePurchasedServer(hostname, ram);

        ns.toast(`${hostname} upgraded to ${ram}GB: ${upgraded}`)
        copyAndRunHacks(ns, hostname)
      } else {
        ns.print(`need ${costToUpgrade - availableFunds} more`)
      }
    }

    ++i;
    await ns.sleep(1000);
  }
}