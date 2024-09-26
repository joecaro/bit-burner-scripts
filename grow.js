import { updateScriptChange } from 'utils/state.js'

/** @param {NS} ns **/
export async function main(ns) {
  const host = ns.getHostname()
  const targetServer = ns.args[0];
  const delay = ns.args[1] || 0;

  if (delay > 0) {
    await ns.sleep(delay);
  }

  const runningScript = ns.getRunningScript();
  if (!runningScript) {
    ns.print("Error: Unable to retrieve running script information.");
    return;
  }
  const threads = runningScript.threads;
  const totalRam = Math.floor(threads * ns.getScriptRam('grow.js', 'home'));

  updateScriptChange({
    ns,
    host,
    script: 'grow',
    totalRam,
    target: targetServer,
    isStart: true,
  })

  await ns.grow(targetServer);

  updateScriptChange({
    ns,
    host,
    script: 'grow',
    totalRam,
    target: targetServer,
    isStart: false,
  })
}