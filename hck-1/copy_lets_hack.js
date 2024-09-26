/** @param {NS} ns */
export async function main(ns) {
    let neighbors = ns.scan(); 
    for (let i = 0; i < neighbors.length; i++) {
      ns.scp('get_host.js', neighbors[i])
      ns.scp('copy_lets_hack.js', neighbors[i])
      ns.scp('kill_lets_hack.js', neighbors[i])
      ns.scp('run_lets_hack.js', neighbors[i])
      ns.scp('lets_hack.js', neighbors[i])
    } 
}