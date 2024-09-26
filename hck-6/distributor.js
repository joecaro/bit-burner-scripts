import { SCRIPT_OFFSET } from './constants'

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  const runningScripts = {};  // Store running script PIDs

  while (true) {
    const next = popQueue(ns);
    if (next) {
      const {
        growThreads,
        weakenThreads,
        growTime,
        weakenTime,
      } = readAllocationFile(ns, next);

      // Check if there's a running instance of batch.js with this target
      const pid = runningScripts[next];
      if (pid && ns.isRunning(pid)) {
        ns.print(`Batch already running on ${next}, skipping...`);
      } else {
        // Execute the batch and store the PID
        const newPid = ns.exec('batch.js', next, 1, target, growThreads, weakenThreads, weakenTime, growTime);
        if (newPid !== 0) {
          runningScripts[next] = newPid;
        } else {
          ns.tprint(`Failed to start batch.js on ${next}`);
        }
      }

      await ns.sleep(SCRIPT_OFFSET);
    } else {
      await ns.sleep(1000);
    }
  }
}

/** @param {NS} ns 
 * @param {string} server */
function readAllocationFile(ns, server) {
  const fileName = `/tmp/allocations_${server}.txt`;
  const fileContent = ns.read(fileName);

  try {
    const allocation = JSON.parse(fileContent);
    return allocation;
  } catch (e) {
    ns.tprint(`Error parsing allocation file: ${e.message}`);
    return null;  // Handle any parsing issues
  }
}

/** @param {NS} ns */
function popQueue(ns) {
  const queueData = ns.read('queue.txt');

  // Check if the queue is empty or invalid
  if (!queueData) return null;

  try {
    const queue = JSON.parse(queueData);

    if (queue.length === 0) return null;

    // Pop the last element from the queue
    const next = queue.pop(); // Use `pop()` to remove and return the last element]

    // Write the modified queue back to 'queue.txt'
    ns.write('queue.txt', JSON.stringify(queue), "w");

    return next; // Return the popped element (the server)
  } catch (e) {
    ns.tprint(`Error parsing JSON from queue: ${e.message}`);
    return null;
  }
}