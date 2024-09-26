import { readState } from './utils/state.js';

const PORT = 1;
const WRITE_INTERVAL = 100; // Time in milliseconds between file writes
let lastWriteTime = Date.now();
let stateModified = false; // Track if state has been modified

/** @param {NS} ns **/
export async function main(ns) {
  const portHandle = ns.getPortHandle(PORT);
  let state = readState(ns);

  ns.tprint(`Listening on port ${PORT}`);

  while (true) {
    // Process all available messages in the port
    while (!portHandle.empty()) {
      const message = portHandle.read();
      try {
        const data = JSON.parse(message);

        // Process the message and update the in-memory state
        processMessage(ns, data, state);

        // Flag that the state has been modified
        stateModified = true;
      } catch (e) {
        ns.print(`Error parsing message: ${message}\n${e}`);
      }
    }

    // Write the updated state to the file if there are changes
    if (stateModified && Date.now() - lastWriteTime >= WRITE_INTERVAL) {
      // Write the updated state to the file
      // ns.write('state.json', JSON.stringify(state, null, 2), 'w');
      window.brState = { ...state }
      stateModified = false; // Reset flag after writing
      lastWriteTime = Date.now();
    }

    await ns.sleep(10); // Sleep briefly to prevent a tight loop
  }
}

function processMessage(ns, data, state) {
  // Check if host is defined, log an error if not
  if (!data.host) {
    ns.print(`Error: Undefined host in message: ${JSON.stringify(data)}`);
    return; // Exit the function early to prevent further issues
  }

  // Ensure state.nodes[data.host] exists
  if (!state.nodes[data.host]) {
    state.nodes[data.host] = {
      batchStart: 0,
      batchLength: 0,
      type: 'idle',
      grow: 0,
      hack: 0,
      weaken: 0,
    };
  }

  switch (data.action) {
    case 'start':
      state.nodes[data.host][data.script] += data.threads;
      state.nodes[data.host].type = data.script;

      if (data.script === 'hack') {
        const targetIdx = state.targets.findIndex(t => t.name === data.target);
        if (targetIdx === -1) {
        } else {
          state.targets[targetIdx].attacks += 1;
        }
      }
      break;

    case 'end':
      state.nodes[data.host][data.script] -= data.threads;
      if (data.script === 'hack' && data.moneyGained) {
        state.stats.moneyGained += data.moneyGained;
        const targetIdx = state.targets.findIndex(t => t.name === data.target);
        state.targets[targetIdx].attacks += 1;
      }

      if (state.nodes[data.host].hack === 0 && state.nodes[data.host].grow === 0 && state.nodes[data.host].weaken === 0) {
        state.nodes[data.host].type = 'idle';
      }
      break;

    case 'update':
      state = applyStateUpdate(state, data.update);
      break;

    case 'reset':
      state.stats.moneyGained = 0;
      state.stats.startTime = Date.now();
      Object.entries(state.nodes).forEach(([node]) => {
        state.nodes[node] = {
          batchStart: 0,
          batchLength: 0,
          type: 'idle',  // Fixed typo from 'idles' to 'idle'
          grow: 0,
          hack: 0,
          weaken: 0,
        };
      });
      state.targets = [];
      break;

    default:
      break;
  }
}


/**
 * Applies the updateData to the current state.
 * @param {object} state - The current state object.
 * @param {object} updateData - The state updates to apply.
 * @returns {object} - The updated state object.
 */
function applyStateUpdate(state, updateData) {
  // Merge updateData into the state object
  return deepMerge(state, updateData);
}

/**
 * Deep merges two objects.
 * @param {object} target - The target object to merge into.
 * @param {object} source - The source object with updates.
 * @returns {object} - The merged object.
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object
    ) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}