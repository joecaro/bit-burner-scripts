/** @param {NS} ns **/
export function getNodes(ns) {
  const servers = ns.getPurchasedServers().concat(['home']);

  const nodes = servers.reduce((acc, server) => {
    acc[server] = {
      batchStart: Date.now(),
      batchLength: 0,
      type: 'idle',
      grow: 0,
      hack: 0,
      weaken: 0,
    };
    return acc;
  }, {});

  return nodes;
}