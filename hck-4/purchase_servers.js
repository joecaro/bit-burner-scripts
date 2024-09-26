/** @param {NS} ns */
export async function main(ns) {
  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  const ram = ns.args[0] || 8;

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    const hostname = "pserv-" + i;
    // Check if we have enough money to purchase a server & server doesn't already exist
    try {
      ns.getServer(hostname)
      ns.toast('already server ' + hostname, 'error')
      i++
    } catch {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        // If we have enough money, then:
        //  .5 Sell server to free up slot
        //  1. Purchase the server
        //  2. Copy our hacking script onto the newly-purchased server
        //  3. Run our hacking script on the newly-purchased server with 3 threads
        //  4. Increment our iterator to indicate that we've bought a new server
        ns.purchaseServer(hostname, ram);
        ns.scp("run_attack.js", hostname);
        ns.exec("run_attack.js", hostname, 1, 9, hostname);
        ns.toast(`purchased server: ${hostname}`)
        ++i;
      }
    }

    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(1000);
  }
}