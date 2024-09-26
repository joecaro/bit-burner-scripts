import './types.js'
import { readState, updateState } from './utils/state.js';
import { allocateResources } from './resource_allocator.js';
import { startBatchManager } from './batch_manager.js';
import { getTargets } from './target_analyzer.js';

import { formatNumber } from 'ui/utils.js'

/**
 * A number, or a string containing a number.
 * @typedef {'Low Income Rate' | 'High RAM Usage' | `High Security ${string}`} Issue
 */

/** @param {NS} ns **/
export async function monitorPerformance(ns) {
  while (true) {
    const state = readState(ns);

    // Collect performance data
    const incomeRate = calculateIncomeRate(ns, state);
    const ramUsage = getRAMUsage(ns);
    const securityLevels = getSecurityLevels(ns, state.targets);
    const moneyLevels = getMoneyLevels(ns, state.targets)

    // Update stats in state
    updateState(ns, (prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        incomeRate,
        ramUsage
      }
    }));

    // Detect issues
    const issues = detectIssues(ns, state, incomeRate, ramUsage, securityLevels, moneyLevels);

    // Adjust operations if needed
    if (issues.length > 0) {
      ns.tprint(`Issues detected: ${issues.join(', ')}`);
      await adjustOperations(ns, state, issues);
    } else {
      ns.tprint(`All systems normal. Income Rate: ${formatNumber(incomeRate, '$0.00a')}/s`);
    }

    // Sleep before next check
    await ns.sleep(5000); // Check every 5 seconds
  }
}

function calculateIncomeRate(ns, state) {
  const elapsedTime = (Date.now() - state.stats.startTime) / 1000; // in seconds
  return state.stats.moneyGained / elapsedTime;
}

function getRAMUsage(ns) {
  let totalRAM = 0;
  let usedRAM = 0;
  const servers = ns.getPurchasedServers().concat(['home']);

  for (const server of servers) {
    const serverMaxRAM = ns.getServerMaxRam(server);
    const serverUsedRAM = ns.getServerUsedRam(server);
    totalRAM += serverMaxRAM;
    usedRAM += serverUsedRAM;
  }

  return { total: totalRAM, used: usedRAM };
}

function getSecurityLevels(ns, targets) {
  const levels = {};
  for (const target of targets) {
    const securityLevel = ns.getServerSecurityLevel(target.name);
    const minSecurity = ns.getServerMinSecurityLevel(target.name);
    levels[target.name] = {
      current: securityLevel,
      min: minSecurity,
    };
  }
  return levels;
}

function getMoneyLevels(ns, targets) {
  const levels = {};
  for (const target of targets) {
    const moneyLevel = ns.getServerMoneyAvailable(target.name);
    const maxMoney = ns.getServerMaxMoney(target.name);
    levels[target.name] = {
      current: moneyLevel,
      max: maxMoney,
    };
  }
  return levels;
}

/** 
 * Find issues and returns a list
 * @returns {Array<Issue>} - list of issues
*/
function detectIssues(ns, state, incomeRate, ramUsage, securityLevels, moneyLevels) {
  const issues = [];

  // Thresholds (adjust as needed)
  const ramUsageThreshold = 0.95; // Maximum RAM usage percentage
  const moneyThreshold = .7; // Minimum acceptable money percentage
  const securityThreshold = 5; // Max acceptable security level above minimum

  // Check RAM usage
  const ramUsagePercent = ramUsage.used / ramUsage.total;
  if (ramUsagePercent > ramUsageThreshold) {
    issues.push('High RAM Usage');
  }

  // Check security levels
  for (const [targetName, levels] of Object.entries(securityLevels)) {
    if (levels.current - levels.min > securityThreshold) {
      issues.push(`High Security on ${targetName}`);
    }
  }

  // Check security levels
  for (const [targetName, levels] of Object.entries(moneyLevels)) {
    if (levels.current / levels.max < moneyThreshold) {
      issues.push(`Low Money on ${targetName}`);
    }
  }

  return issues;
}

/**
 * @param {NS} ns
 * @param {State} state
 * @param {Array<Issue>} issues
*/
async function adjustOperations(ns, state, issues) {
  // Implement actions based on detected issues
  for (const issue of issues) {
    if (issue === 'Low Income Rate') {
      await handleLowIncomeRate(ns, state);
    } else if (issue === 'High RAM Usage') {
      handleHighRAMUsage(ns, state);
    } else if (issue.startsWith('Low Money')) {
      const targetName = issue.split(' on ')[1];
      await handleLowMoney(ns, targetName);
    } else if (issue.startsWith('High Security')) {
      const targetName = issue.split(' on ')[1];
      await handleHighSecurity(ns, targetName);
    }
  }
}
/**
 * @param {NS} ns
 * @param {State} state
*/
async function handleLowIncomeRate(ns, state) {
  ns.print('Handling Low Income Rate: Re-evaluating targets and reallocating resources.');

  // Re-analyze targets
  const targets = getTargets(ns);

  // Reallocate resources
  const allocations = allocateResources(ns, targets);

  // Restart batch managers with new allocations
  for (const target of targets) {
    // Kill existing batch managers for the target
    ns.scriptKill('batch_executor.js', 'home', target.name);
    // Start new batch manager
    startBatchManager(ns, target, allocations[target.name]);
  }

  // Update state with new targets and allocations
  updateState(ns, (prev) => ({
    ...prev,
    allocations
  }));
}

/**
 * @param {NS} ns
 * @param {State} state
*/
function handleHighRAMUsage(ns, state) {
  ns.print('Handling High RAM Usage: Reducing batch sizes.');

  // Reduce batch sizes by adjusting the desired hack percentage
  updateState(ns, (prev) => ({
    ...prev,
    settings: {
      ...prev.settigns,
      desiredHackPercent: (state.settings.desiredHackPercent || .1) * 0.9
    }
  }));

  ns.print(`New desired hack percentage: ${state.settings.desiredHackPercent * 100}%`);
}


/**
 * @param {NS} ns
 * @param {string} targetName
*/
async function handleLowMoney(ns, targetName) {
  ns.print(`Handling Low Money on ${targetName}: Initiating server prep on all nodes.`);

  // Kill existing batch executor for the target
  ns.scriptKill('batch_executor.js', 'home', targetName);

  // Run server prep script across all available servers
  const servers = ns.getPurchasedServers().concat(['home']);
  for (const server of servers) {
    const availableRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    if (availableRAM > ns.getScriptRam('server_prep.js')) {
      if (!ns.getRunningScript('server_prep.js', server, targetName)) {
        ns.run('server_prep.js', 1, targetName);
      }
    }
  }

  // Wait for the server to be prepped
  while (true) {
    if (isServerPrepped(ns, targetName)) {
      ns.print(`${targetName} is prepped. Restarting batch executor.`);
      break;
    }
    await ns.sleep(5000);
  }

  // Restart batch executor
  const state = readState(ns);
  const allocatedRAM = state.allocations[targetName];
  ns.run('batch_executor.js', 1, targetName, allocatedRAM);
}

/**
 * @param {NS} ns
 * @param {string} targetName
*/
async function handleHighSecurity(ns, targetName) {
  ns.print(`Handling High Security on ${targetName}: Initiating server prep on all nodes.`);

  // Kill existing batch executor for the target
  ns.scriptKill('batch_executor.js', 'home', targetName);

  // Run server prep script across all available servers
  const servers = ns.getPurchasedServers().concat(['home']);
  for (const server of servers) {
    const availableRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    if (availableRAM > ns.getScriptRam('server_prep.js')) {
      if (!ns.getRunningScript('server_prep.js', server, targetName)) {
        ns.run('server_prep.js', 1, targetName);
      }
    }
  }

  // Wait for the server to be prepped
  while (true) {
    if (isServerPrepped(ns, targetName)) {
      ns.print(`${targetName} is prepped. Restarting batch executor.`);
      break;
    }
    await ns.sleep(5000);
  }

  // Restart batch executor
  const state = readState(ns);
  const allocatedRAM = state.allocations[targetName];
  ns.run('batch_executor.js', 1, targetName, allocatedRAM);
}

/**
 * @param {NS} ns
 * @param {string} target
*/
function isServerPrepped(ns, target) {
  return (
    ns.getServerSecurityLevel(target) <= ns.getServerMinSecurityLevel(target) + 0.5 &&
    ns.getServerMoneyAvailable(target) >= ns.getServerMaxMoney(target) * 0.99
  );
}