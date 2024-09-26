/** @param {NS} ns */
export async function main(ns) {
  if (!window.brEventQueue) {
    window.brEventQueue = [];
  }

  while (true) {
    const event = window.brEventQueue.shift();

    if (event) {
      event(ns)
    }

    await ns.sleep(500)
  }
}