/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  addToQueue(ns, target)
}


/** @param {NS} ns 
 *  @param {string} server */
function addToQueue(ns, server) {
  const queue = [...JSON.parse(ns.read('queue.txt'))];

  if (!queue.includes(server)) {
    queue.push(server)
  }

  ns.write('queue.txt', JSON.stringify(queue), 'w')
}