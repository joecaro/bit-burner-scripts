import insertAndRunHacks from './utils/insert_and_run_hacks.js'

/** @param {NS} ns */
export async function main(ns) {
  const servers = ns.scan('home').filter(server => server.includes('pserv'));
  for (let i = 0; i < servers.length; i++) {
    const targetServer = servers[i];

    // DEPLOY ATTCKS
    insertAndRunHacks({ ns, targetServer });
  }
}