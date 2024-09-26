import { getAccessibleServers } from 'utils/sniffers.js'

/** @param {NS} ns **/
export async function main(ns) {
    // List of scripts to copy
    const scriptsToCopy = [
        'hack.js',
        'grow.js',
        'weaken.js',
        'batch_executor.js',
        'server_prep.js',
        'thread_calculator.js',
        'timing_scheduler.js',
        'utils.js',
        'utils/state.js',
        'utils/sniffers.js',
        'constants.js',
        // Add any other scripts or dependencies required
    ];

    // Get a list of all servers in the network
    const [servers] = getAccessibleServers(ns);

    // Loop through each server
    for (const server of servers) {
        // Skip the home server
        if (server === 'home') continue;

        // Check if you have root access to the server
        if (ns.hasRootAccess(server)) {
            // Copy the scripts to the server
            const success = ns.scp(scriptsToCopy, server);
            if (success) {
            } else {
                ns.tprint(`Failed to copy scripts to ${server}`);
            }
        } else {
            ns.tprint(`No root access to ${server}. Cannot copy scripts.`);
        }
    }
}