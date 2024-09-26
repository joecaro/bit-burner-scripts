/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const hackThreads = ns.args[1];  // Number of threads to run hack
  const growThreads = ns.args[2];  // Number of threads to run grow
  const weakenThreads1 = ns.args[3]; // Threads for the first weaken
  const weakenThreads2 = ns.args[4]; // Threads for the second weaken
  const batches = ns.args[5]

  // Calculate the time needed for each action
  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const stopDelta = 100; // Buffer time between operations to prevent overlap (in ms)

  // We know the order of completion:
  // 1. weaken1
  // 2. grow
  // 3. weaken2
  // 4. hack

  // So, calculate when each task should start:
  // Weaken1 starts first
  const weaken1Start = 0; // Weaken1 starts immediately

  // Grow must finish before weaken2, so calculate when to start grow
  const growFinish = weakenTime - stopDelta; // Grow finishes before weaken2
  const growStart = growFinish - growTime; // Grow needs to start earlier to finish at growFinish

  // Weaken2 finishes after grow, so it can start right after grow finishes
  const weaken2Finish = weakenTime - stopDelta * 2; // Weaken2 finishes after grow
  const weaken2Start = weaken2Finish - weakenTime; // Weaken2 finishes after grow

  // Hack must finish last, so it starts after weaken2 and grow
  const hackFinish = weakenTime - stopDelta * 3; // Hack finishes after weaken2 finishes
  const hackStart = hackFinish - hackTime; // Hack needs to start earlier to finish at hackFinish

  let batch = 1;

  ns.toast(`BATCHES: ${batches}`)

  while (true) {
    // Step 1: Start Weaken 1 (longest operation)
    ns.run("batch.js", 1,
      target,
      weaken1Start,
      weaken2Start,
      growStart,
      hackStart,
      weakenThreads1,
      weakenThreads2,
      growThreads,
      hackThreads,
      batches
    );

    if (batch < batches) {
      batch++;
      await ns.sleep(stopDelta);
    } else {
      batch = 1;
      await ns.sleep(weakenTime - stopDelta)
    }
  }
}