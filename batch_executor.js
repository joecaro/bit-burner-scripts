import { calculateThreads } from './thread_calculator.js';
import { getTimingSchedule } from './timing_scheduler.js';
import { isServerPrepped } from './server_prep.js';

/** @param {NS} ns **/
export async function main(ns) {
  const targetName = ns.args[0];
  const allocatedRAM = ns.args[1];
  const maxParallelBatches = 5;  // Number of parallel batches
  const batchInterval = 2000;    // Time (in ms) between each new batch start

  try {
    if (!isServerPrepped(ns, targetName)) {
      return;
    }

    let activeBatches = 0;

    while (true) {
      try {
        if (activeBatches < maxParallelBatches) {
          // Calculate threads and timing schedule
          const threads = calculateThreads(ns, targetName, allocatedRAM);
          const schedule = getTimingSchedule(ns, targetName);

          // Launch batch.js as a separate script
          const pid = ns.exec('batch.js', 'home', 1, targetName, JSON.stringify(threads), JSON.stringify(schedule));
          if (pid === 0) {
            ns.print(`Failed to start batch.js for ${targetName}`);
          } else {
            ns.print(`Started batch.js for ${targetName} with PID ${pid}`);
            activeBatches++;
          }

          // Wait for the interval before starting the next batch
          await ns.sleep(batchInterval);
        }

      } catch (e) {
        ns.toast(`Error: ${e}`, 'error');
      }
    }
  } catch (e) {
    ns.toast(e, 'error');
  }
}