import { getAccessibleServers } from './utils/sniffers.js'
import { updateState, readState, stateFile } from "./utils/state.js";
import { formatNumber } from 'ui/utils.js'

/** @param {NS} ns */
export async function main(ns) {
  try {
    const state = readState(ns, stateFile)

    if (!state.target.name || !ns.serverExists(state.target.name)) {
      ns.tprintRaw(
        React.createElement(
          'div',
          { style: { display: flex } },
          React.createElement(
            'div',
            { style: { border: '1px solid red', borderRadius: '10px', padding: '10px', width: 'fit-content', color: 'red' } },
            !state.target.name ? 'NO TARGET PROVIDED' : 'TARGET DOES NOT EXIST'
          ),
          React.createElement(
            'span',
            { style: { color: 'white' } },
            'home server'
          )
        )
      )
      return;
    }

    while (true) {

      while (ns.getServerSecurityLevel(state.target.name) > state.target.minSecurity * 1.1 || ns.getServerMoneyAvailable(state.target.name) < state.target.maxMoney * .85) {
        const batchLoopState = readState(ns, stateFile)

        const maxRam = ns.getServerMaxRam('home');
        const usedRam = ns.getServerUsedRam('home');
        const availableRam = maxRam - usedRam - 60; // prep script/gui/script/buffer/etc

        const growRam = ns.getScriptRam('grow.js')
        const weakenRam = ns.getScriptRam('weaken.js')

        const growRatio = .9;
        const weakenRatio = .1;

        const threadsOfGrow = Math.floor((growRatio * availableRam) / growRam)
        const threadsOfWeaken = Math.floor((weakenRatio * availableRam) / weakenRam)


        const weakenTime = ns.getWeakenTime(state.target.name);
        const growTime = ns.getGrowTime(state.target.name);

        if (!ns.scriptRunning('batch.js', 'home')) {
          updateState(ns, (prev) => {
            prev.nodes.home = {
              startTime: Date.now(),
              batchLength: weakenTime,
              type: 'batch'
            }
          })
          ns.run('batch.js', 1, state.target.name, threadsOfGrow, threadsOfWeaken, growTime, weakenTime)
        }
        await ns.sleep(1000)
      }

      // HACK
      if (ns.scriptRunning('batch.js', 'home')) {
        ns.scriptKill('batch.js', 'home')
      }
      if (ns.scriptRunning('weaken.js', 'home')) {
        ns.scriptKill('weaken.js', 'home')
      }
      if (ns.scriptRunning('grow.js', 'home')) {
        ns.scriptKill('grow.js', 'home')
      }

      ns.toast(`${state.target.name} SERVER PREPPED! HACKING >:)`)

      const { growthRate, weakenRate } = getGrowthWeakenRate(ns, state.target.name);
      const hackTime = ns.getHackTime(state.target.name);

      const growth = growthRate * hackTime;

      const hackMultiplier = JSON.parse(ns.read('hack-multiplier.txt'))
      ns.toast(`GROWTH: ${formatNumber(growth)} --w/ mult--> ${formatNumber(growth * hackMultiplier)} `, 'info', 5000)

      const hackThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(state.target.name, growth * hackMultiplier)), 1)

      const hacksToRun = Math.min(hackThreads, 4)

      updateState(ns, (prev) => {
        prev.nodes.home = {
          startTime: Date.now(),
          batchLength: hackTime + (hacksToRun * 200),
          type: 'hack'
        }
      })

      for (let i = 0; i < hacksToRun; i++) {
        ns.run('hack.js', Math.floor(hackThreads / hacksToRun), state.target.name)
        await ns.sleep(200) // hack.js updates files, so make sure it has time to do this
      }
      await ns.sleep(hackTime)
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * Calculates the total growth and weaken rates across accessible servers running batch.js.
 *
 * @param {NS} ns - The Netscript interface.
 * @param {string} target - The target server name.
 * @returns {{ growthRate: number, weakenRate: number }} - The cumulative growth and weaken rates.
 */
function getGrowthWeakenRate(ns, target) {
  const [accessibleServers] = getAccessibleServers(ns, 10); // assuming this returns an array of servers

  let totalGrowthRate = 0;
  let totalWeakenRate = 0;

  // Fetch the growth parameter for the target server
  const serverGrowthParam = ns.getServerGrowth(target);
  const currentMoney = ns.getServerMoneyAvailable(target);
  const maxMoney = ns.getServerMaxMoney(target);

  for (const server of accessibleServers) {
    if (ns.scriptRunning('batch.js', server)) {
      const runningScripts = ns.ps(server);
      for (const script of runningScripts) {
        if (script.filename === 'batch.js') {
          const growThreads = script.args[1];
          const weakenThreads = script.args[2];
          const growTime = script.args[3];
          const weakenTime = script.args[4];

          // Estimate growth factor based on the target server's growth parameter and the grow threads
          const growthMultiplier = Math.pow(1 + serverGrowthParam / 100, growThreads);
          const estimatedGrowth = currentMoney * growthMultiplier;

          // Ensure growth doesn't exceed max money
          const finalMoney = Math.min(estimatedGrowth, maxMoney);
          const growthAmount = finalMoney - currentMoney;

          // Avoid division by zero or very small growTime values
          if (growTime > 0) {
            // Calculate growth rate per second
            const serverGrowthRate = growthAmount / growTime;
            totalGrowthRate += serverGrowthRate;
          }

          // Weaken calculation
          const serverWeakenAmount = weakenThreads > 0 ? ns.weakenAnalyze(weakenThreads) : 0;
          if (weakenTime > 0) {
            const serverWeakenRate = serverWeakenAmount / weakenTime;
            totalWeakenRate += serverWeakenRate;
          }
        }
      }
    }
  }

  return {
    growthRate: totalGrowthRate,
    weakenRate: totalWeakenRate
  };
}