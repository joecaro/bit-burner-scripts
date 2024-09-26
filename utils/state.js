/**
 * @typedef {Object} Stats
 * @property {number} hackLevel - The current hack level.
 * @property {number} money - The current amount of money.
 * @property {number} moneyGained - The net money gained.
 * @property {number} startTime - The start time in milliseconds.
 */

/**
 * @typedef {Object} Target
 * @property {string} name - The name of the target.
 * @property {number} attacks - Number of attacks on the target.
 */

/**
 * @typedef {Object} Node
 * @property {number} hack - The number of hack threads.
 * @property {number} grow - The number of grow threads.
 * @property {number} weaken - The number of weaken threads.
 * @property {number} batchLength - The length of the batch in milliseconds.
 * @property {number} startTime - The start time of the batch in milliseconds.
 * @property {'hack' | 'grow' | 'weaken' | 'idle'} type - The type of the operation currently running.
 */

/**
 * @typedef {Object.<string, Node>} Nodes
 */

/**
 * @typedef {Object.<string, Target>} Targets
 */

/**
 * @typedef {Object} State
 * @property {Stats} stats - The statistics of the state.
 * @property {Targets} targets - The target details.
 * @property {Nodes} nodes - The nodes information.
 * @property {Object} allocations - Allocation of resources.
 * @property {Object} settings - Script settings.
 * @property {number} settings.desiredHackPercent - The desired percentage of hack.
 */


const INITIAL_STATE = {
  "stats": {
    "hackLevel": 0,
    "money": 0,
    "moneyGained": 0,
    "startTime": 1726346692141,
    "incomeRate": 0,
    "ramUsage": {
      "total": 0,
      "used": 0
    }
  },
  "nodes": {},
  "targets": [],
  "allocations": {},
  "settings": {
    "desiredHackPercent": .01
  }
}


/**
 * Reads and parses the JSON state file.
 * @param {NS} ns - The Netscript API.
 * @returns {State} - Parsed state object.
 */
export function readState(ns) {
  if (!window.brState) {
    window.brState = { ...INITIAL_STATE };
  }
  return window.brState;
}

/**
 * Writes the given data to the state.
 * @param {State} data - The state data to write.
 */
export function writeState(data) {
  window.brState = data;
}

/**
 * Updates the state by applying the callback function.
 * @param {NS} ns - The Netscript API.
 * @param {function(State): void} updateCB - The callback function that modifies the state.
 */
export function updateState(ns, updateCB) {
  const state = readState(ns);
  const newState = updateCB(state);  // Modify state in place
  writeState(newState);  // Persist changes
}

/**
 * Initializes the state with the default values.
 * @param {NS} ns - The Netscript API.
 */
export function initState(ns) {
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

  writeState({
    stats: {
      hackLevel: ns.getHackingLevel(),
      money: ns.getServerMoneyAvailable('home'),
      moneyGained: 0,
      startTime: Date.now(),
    },
    targets: [],
    allocations: {},
    nodes,
    settings: {
      desiredHackPercent: .1,
    },
  });
}

/**
 * Updates the state at the start or end of a hack, grow, or weaken operation.
 * 
 * @param {Object} props - The parameters object.
 * @param {NS} props.ns - The Netscript API.
 * @param {string} props.host - The host running the script.
 * @param {'hack' | 'grow' | 'weaken'} props.script - The script type being updated.
 * @param {number} props.totalRam - The RAM used by the script.
 * @param {string} props.target - The target server.
 * @param {boolean} props.isStart - Whether the script is starting or ending.
 * @param {number} [props.moneyGained] - The money gained from a hack (only applicable for hack).
 */
export function updateScriptChange({
  ns,
  host,
  script,
  totalRam,
  target,
  isStart,
  moneyGained,
}) {
  updateState(ns, (prev) => {
    // Ensure the node for the host exists
    if (!prev.nodes[host]) {
      prev.nodes[host] = {
        hack: 0,
        grow: 0,
        weaken: 0,
        batchLength: 0,
        startTime: 0,
        type: 'idle',
      };
    }

    prev.nodes[host][script] += (totalRam * (isStart ? 1 : -1));

    if (script === 'hack') {
      prev.nodes[host].type = isStart ? script : 'idle';
      const targetIdx = prev.targets.findIndex((t) => t.name === target);
      if (targetIdx === -1) {
        prev.targets.push({
          name: target,
          attacks: isStart ? 1 : 0,
        });
      } else {
        prev.targets[targetIdx].attacks += (isStart ? 1 : -1);
      }
    }

    // Update money gained from hacking, if applicable
    if (script === 'hack' && moneyGained) {
      prev.stats.moneyGained += moneyGained;
    }

    return prev;
  });
}