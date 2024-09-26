/** @param {NS} ns */
export async function main(ns) {
  const ram = ns.args[0];

  if (!ram) {
    ns.tprint("NO RAM PROVIDED")
    return;
  }

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to upgrade servers until we've upgraded them all
  while (i < ns.getPurchasedServerLimit()) {
    const hostname = "pserv-" + i;
    // Check if we have enough money to purchase a server & server doesn't already exist
    if (ns.serverExists(hostname)) {
      if (ns.getServerMaxRam(hostname) < ram && ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(hostname, ram)) {
        ns.upgradePurchasedServer(hostname, ram)
        ns.toast(`upgraded server: ${hostname} to ${ram}GB`)
      }
      i++
    } else {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        ns.purchaseServer(hostname, ram);
        ns.run('add_to_queue.js', 1, hostname)
        ns.toast(`purchased server: ${hostname}`)
        ++i;
      }
    }
    await ns.sleep(1000);
  }
}