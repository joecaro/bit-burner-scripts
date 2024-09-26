/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  ns.scp('hack.js', target);

  ns.print('hacking ', target);
  ns.exec('./hack.js', target, 1, target);

  // ns.print('growing ', target);
  // ns.exec('grow.js', target, 1, target);

  // ns.print('weakening ', target);
  // ns.exec('weaken.js', target, 1, target);
}