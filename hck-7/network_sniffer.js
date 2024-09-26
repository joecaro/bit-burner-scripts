import { getAccessibleServers, getServerInfo } from './utils/sniffers.js'

/** @param {NS} ns */
export async function main(ns) {
  let currentDepth = 1;

  while (true) {
    const currentServers = JSON.parse(ns.read('network.txt'))

    const [accessibleServers, inaccessibleServers] = getAccessibleServers(ns, currentDepth);
    if (inaccessibleServers.length === 0) {
      currentDepth++;
    }

    accessibleServers.forEach(server => {
      ns.scp('constants.js', server)
      ns.scp('batch.js', server)
      ns.scp('hack.js', server)
      ns.scp('grow.js', server)
      ns.scp('weaken.js', server)
    })

    const servers = accessibleServers.map(server => getServerInfo(ns, server))


    if (servers.length !== currentServers.length) {
      ns.write('network.txt', JSON.stringify(servers), 'w')
      ns.toast("Updated network.txt")
    }

    await ns.sleep(5000)
  }
}