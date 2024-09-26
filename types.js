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
 * @property {number} money - The current amount of money.
 * @property {number} maxMoney - The maximum amount of money.
 * @property {number} security - The current security level.
 * @property {number} minSecurity - The minimum security level.
 */

/**
 * @typedef {Object} Node
 * @property {number} hack - The number of hack threads.
 * @property {number} grow - The number of grow threads.
 * @property {number} weaken - The number of weaken threads.
 */

/**
 * @typedef {Object.<string, Node>} Nodes
 */
/**
 * @typedef {Object.<string, number>} Targets
 */

/**
 * @typedef {Object} State
 * @property {Stats} stats - The statistics of the state.
 * @property {Targets} targets - The target details.
 * @property {Nodes} nodes - The nodes information.
 */