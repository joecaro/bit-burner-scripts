import { getAccessibleServers } from './utils/sniffers.js'
import { initState } from './utils/state.js'

/** @param {NS} ns */
export async function main(ns) {
  ns.killall();
  // reset system state
  initState(ns)

  const [accessibleServers] = getAccessibleServers(ns, 10);

  accessibleServers.forEach(server => {
    ns.scp('constants.js', server)
    ns.scp('batch.js', server)
    ns.scp('hack.js', server)
    ns.scp('grow.js', server)
    ns.scp('weaken.js', server)
  })

  for (const server of accessibleServers) {
    ns.killall(server)
  }

  ns.toast('processes terminated')
  ns.run('stats.js')
  ns.run('event_dispatcher.js')
}