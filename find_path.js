/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  if (!target) {
    ns.toast("ERROR: NO TARGET PROVIDED");
    return;
  }

  const depth = Number(ns.args[1]) || Infinity; // Default to Infinity if depth not provided
  if (isNaN(depth)) {
    ns.tprint("depth must be a number");
    return;
  }

  const visited = new Set();

  function dfs(server, path, currentDepth) {
    if (currentDepth > depth) return null; // Exceeded maximum depth
    if (visited.has(server)) return null;
    visited.add(server);
    path.push(server);

    if (server === target) {
      return [...path];
    }

    const neighbors = ns.scan(server);
    for (let neighbor of neighbors) {
      const result = dfs(neighbor, path, currentDepth + 1);
      if (result) return result;
    }

    path.pop();
    return null;
  }

  const path = dfs('home', [], 0);

  if (path) {
    ns.tprint("FOUND IT");
    ns.tprint(path.join(' -> '));
    return;
  }

  ns.tprint(`No path to ${target} found within depth ${depth}`);
}