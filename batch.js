// batch.js
import { runHackScript, runGrowScript, runWeakenScript } from './utils.js';

/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const threads = JSON.parse(ns.args[1]); // Threads passed as a JSON string
  const schedule = JSON.parse(ns.args[2]); // Schedule passed as a JSON string

  // Execute weaken, grow, hack sequentially with delays
  await runWeakenScript(ns, target, threads.weaken2, schedule.weaken2Delay);
  await runGrowScript(ns, target, threads.grow, schedule.growDelay);
  await runWeakenScript(ns, target, threads.weaken1, schedule.weaken1Delay);
  await runHackScript(ns, target, threads.hack, schedule.hackDelay);
  await ns.sleep(100)
}