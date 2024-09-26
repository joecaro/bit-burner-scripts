import insertAndRunHack from './utils/insert_and_run_hacks.js'

/** @param {NS} ns */
export async function main(ns) {
  const hackee = ns.args[0]

  if (!hackee) {
    ns.tprintRaw(
      React.createElement(
        'p',
        {
          style: {
            padding: '5px',
            width: 'fit-content',
            border: '1px solid red',
            borederRadius: "5px",
            color: 'red'
          }
        },
        "NO TARGET PROVIDED"
      )
    )
    return;
  }

  insertAndRunHack(ns, 'home', hackee);
}