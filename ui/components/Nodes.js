import theme from 'ui/theme.js'
import { htmlStringToReact } from 'ui/utils.js'

import { formatNumber } from "ui/utils.js";
import { readState } from "utils/state.js";

import { Row, ProgressBar } from './common.js'
import Grid from './grid.js'



/**
 * Creates a node.
 * 
 * @param {Object} props - The parameters object.
 * @param {NS} props.ns - NS
 * @param {string} props.node - node name
 * @param {{hack: number, grow: number, weaken: number}} props.stats - node name
 * @param {number} props.length - length of progress bar
 * @param {CSSStyleDeclaration} props.style - style overrides
 * @returns {React.Element} node
 */
const Node = ({ ns, node, stats, style }) => {
  const maxRam = ns.getServerMaxRam(node);
  return React.createElement(
    'span',
    {
      style: {
        color: 'rgba(255,255,255,.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: theme.spacing.sm,
        border: `1px solid ${stats.type === 'hack' ? 'rgb(150, 0, 0)' : 'rgba(255, 255, 255, .2)'}`,
        backgroundColor: 'rgba(0,0,0,.2)',
        ...style
      },
    },
    htmlStringToReact(`<span>${node.length > 12 ? node.slice(0, 9).concat('...') : node} _____ ${formatNumber(maxRam)}</span>`),
    React.createElement(
      Row,
      {
        style: { padding: 0 }
      },
      `H: ${formatNumber(stats.hack, 0)}`,
      ProgressBar({
        percent: Math.min(Math.max(stats.hack / maxRam, 0), 1),
        length: 10,
        style: { fontSize: '7px', padding: '5px' }
      })
    ),
    React.createElement(
      Row,
      {
        style: { padding: 0 }
      },
      `G: ${formatNumber(stats.grow, 0)}`,
      ProgressBar({
        percent: Math.min(Math.max(stats.grow / maxRam, 0), 1),
        length: 10,
        style: { fontSize: '7px', padding: '5px' }
      })
    ),
    React.createElement(
      Row,
      {
        style: { padding: 0 }
      },
      `W: ${formatNumber(stats.weaken, 0)}`,
      ProgressBar({
        percent: Math.min(Math.max(stats.weaken / maxRam, 0), 1),
        length: 10,
        style: { fontSize: '7px', padding: '5px' }
      })
    ),
  )
}

/**
 * Creates a Grid of Nodes.
 * 
 * @param {Object} params - The parameters object.
 * @param {NS} params.ns
 * @returns {React.Element} The text-based progress bar.
 */
const Nodes = ({ ns }) => {
  const state = readState(ns)
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
      "Active Nodes"
    ),
    React.createElement(
      Grid,
      { style: { color: 'white' } },
      ...Object.entries(state.nodes).map(([node, stats]) => Node({ ns, node, stats }))
    )
  )

}


export default Nodes;