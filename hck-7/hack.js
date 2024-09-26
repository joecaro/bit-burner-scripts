
import { readState, updateState } from "./utils/state.js";
import { formatNumber, formatTimeStringMS } from './ui/utils.js'

/** @param {NS} ns **/
export async function main(ns) {
  const targetServer = ns.args[0];

  const now = Date.now();
  const state = readState(ns)


  const amount = await ns.hack(targetServer);

  ns.tprint("_____________________________________")
  ns.tprint(`HACKS/SEC: $${formatNumber(state.stats.moneyGained / ((now - state.stats.startTime) / 1000))}/sec`)
  ns.tprint(`total gain: $${formatNumber(state.stats.moneyGained)}`)
  ns.tprint(`time tracked: ${formatTimeStringMS(now - state.stats.startTime)}`)
  updateState(ns, (prev) => {
    prev.stats.moneyGained += amount
  })
}