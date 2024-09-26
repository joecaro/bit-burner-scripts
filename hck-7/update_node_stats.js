import { updateState } from "./utils/state.js";

/** @param {NS} ns */
export async function main(ns) {
  const nodeName = ns.args[0]
  const batchLength = ns.args[1]
  const isRunning = ns.args[2] !== false;

  const startTime = Date.now(); // Record start time of batch run

  updateState(ns, (prev) => {
    prev.nodes[nodeName] = {
      startTime: startTime,
      batchLength: batchLength,
      type: 'batch',
      isRunning: isRunning
    }
  })
}
