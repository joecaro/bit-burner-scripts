/** @param {NS} ns **/
export async function main(ns) {
  const targetServer = ns.args[0];

  const amount = await ns.hack(targetServer);
}