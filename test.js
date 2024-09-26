import { getAccessibleServers } from './utils/sniffers.js'

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const [accessibleServers] = getAccessibleServers(ns, 10); // assuming this returns an array of servers

  let totalGrowthRate = 0;
  let totalWeakenRate = 0;

  for (const server of accessibleServers) {
    if (ns.scriptRunning('batch.js', server)) {
      const runningScripts = ns.ps(server);
      for (const script of runningScripts) {
        if (script.filename === 'batch.js') {
          const growThreads = script.args[1]
          const weakenThreads = script.args[2]
          const growTime = script.args[3]
          const weakenTime = script.args[4]

          // Fetch server growth parameter and calculate potential money growth
          const serverGrowthParam = ns.getServerGrowth(server);
          const currentMoney = ns.getServerMoneyAvailable(server);
          const maxMoney = ns.getServerMaxMoney(server);

          // Estimate growth factor from grow threads
          const growthMultiplier = 1 + (serverGrowthParam / 100) * growThreads;
          const estimatedGrowth = currentMoney * growthMultiplier;

          // Ensure growth doesn't exceed max money
          const finalMoney = Math.min(estimatedGrowth, maxMoney);
          const growthAmount = finalMoney - currentMoney;

          // Calculate growth rate per second
          const serverGrowthRate = growthAmount / growTime;





          const serverWeakenAmount = weakenThreads > 0 ? ns.weakenAnalyze(weakenThreads) : 0; // Adjust hack amount calculation based on weaken
          const serverWeakenRate = serverWeakenAmount / weakenTime;


          totalGrowthRate += serverGrowthRate;
          totalWeakenRate += serverWeakenRate;
        }
      }
    }
  }

  return {
    growthRate: totalGrowthRate,
    weakenRate: totalWeakenRate
  }
}
