/** @param {NS} ns */
export async function main(ns) {
    const hostname = ns.args[0]
    
    // copy files to child nodes
    ns.run('copy_lets_hack.js')

    // run lets_hack if we're not on home
    if (hostname) {
      ns.run('lets_hack.js', 1, hostname)
    }

    let neighbors = ns.scan(); 
    for (let i = 0; i < neighbors.length; i++) {
      ns.print('executing on ', neighbors[i])
      ns.exec('run_lets_hack.js', neighbors[i], 1, neighbors[i])
    } 
}