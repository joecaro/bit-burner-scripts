/** @param {NS} ns **/
export async function main(ns) {
  ns.scriptKill('file_gui_exe.js', 'home')
  ns.run('file_gui_exe.js')
}