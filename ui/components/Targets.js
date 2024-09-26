import theme from '../theme.js'
import { ProgressBar, Row } from './common.js'
import Grid from './grid.js'

import { readState } from "utils/state.js";



/**
 * Creates a node.
 * 
 * @param {Object} props - The parameters object.
 * @param {NS} props.ns - length of progress bar
 * @param {{ name: string, maxMoney: number, minSecurity: number, priority: number}} params.target - target
 * @param {number} props.length - length of progress bar
 * @param {CSSStyleDeclaration} props.style - style overrides
 * @returns {React.Element} target
 */
const Target = ({ ns, target, length = 12, style }) => {
  const money = ns.getServerMoneyAvailable(target.name)
  const security = ns.getServerSecurityLevel(target.name)
  return React.createElement(
    'span',
    {
      style: {
        color: 'rgba(255,255,255,.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: theme.spacing.sm,
        border: `1px solid 'rgba(255, 255, 255, .2)'}`,
        ...style
      },
    },
    Row({ children: [target.name.length > 12 ? target.name.slice(0, 9).concat('...') : target.name, !!target.attacks ? "*" : ""], style: { padding: 0 } }),
    Row({
      style: { padding: theme.spacing.sm },
      children: [
        ProgressBar({
          // Ensure percent is clamped between 0 and 1
          percent: Math.min(money / target.maxMoney, 1),
          length: length,
          style: { fontSize: '7px', padding: '5px 0' }
        }),
        Math.min(money / target.maxMoney, 1).toFixed(2)]
    }),
    Row({
      style: { padding: theme.spacing.sm },
      children: [
        ProgressBar({
          // Ensure percent is clamped between 0 and 1
          percent: 1 - Math.min((50 - target.minSecurity) / (security - target.minSecurity), 1),
          length: length,
          style: { fontSize: '7px' },
          reverse: true
        }),
        `${((1 - Math.min((50 - target.minSecurity) / (security - target.minSecurity), 1)).toFixed(2)) * 100}%`
      ]
    })
  )
}

/**
 * Creates a Grid of Target Stats.
 * 
 * @param {Object} params - The parameters object.
 * @param {NS} params.ns
 * @returns {React.Element} The text-based progress bar.
 */
const Targets = ({ ns }) => {
  const state = readState(ns)
  const priorityTargets = state.targets.sort((a, b) => b.priority - a.priority)
  return React.createElement(
    'div',
    {
      style: {
        padding: theme.spacing.sm,
        backgroundColor: 'rgba(0,0,0,.2)'
      }
    },
    React.createElement(
      Row, {
      style: {
        paddingLeft: '0',
        color: theme.color.white,
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }
    },
      "Active Targets"
    ),
    React.createElement(
      Grid,
      { style: { color: 'white', rowGap: '15px' } },
      ...priorityTargets.map((target) => Target({ ns, target }))
    )
  )

}


export default Targets;