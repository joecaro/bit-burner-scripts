/** @param {NS} ns */
export async function main(ns) {
    const target = ns.getServer().hostname;
    console.log(target)
     ns.print(target)
    return target;
}