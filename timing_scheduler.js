// timing_scheduler.js

/** @param {NS} ns **/
export function getTimingSchedule(ns, target) {
  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);
  const timingBuffer = 200; // milliseconds

  return {
    hackDelay: weakenTime - hackTime - 3 * timingBuffer,
    weaken1Delay: 2 * timingBuffer,
    growDelay: weakenTime - growTime - timingBuffer,
    weaken2Delay: 0,
    weakenTime: weakenTime,
    batchInterval: timingBuffer * 4, // Adjust as needed
  };
}