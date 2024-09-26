/** @param {NS} ns */
export async function main(ns) {
  // Defines the "target server", which is the server
  const target = "silver-helix";

  // If we have the BruteSSH.exe program, use it to open the SSH Port
  // on the target server
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
  }

  // Get root access to target server
  ns.nuke(target);

  const attacker = ns.args[0]

  ns.tprint('running at: ' + attacker)

  ns.exec('script_manager.js', attacker, 1, target, attacker);
}