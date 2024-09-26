import theme from '../theme.js'
import { Label, Row } from './common.js'

export default function Buttons({ ns }) {
  const state = JSON.parse(ns.read('state.json'))

  const start = () => {
    try {
      ns.run('start.js', 1, bestTarget)
    } catch (e) {
      console.error(e)
    }
  }


  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Row,
      { style: { color: theme.color.white } },
      Label({ text: 'Best Trgt' }),
      state
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-around',
          padding: theme.spacing.md
        }
      },
      React.createElement(
        'button',
        {
          onClick: start,
          style: {
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.color.green,
            borderRadius: theme.spacing.sm,
            border: `1px dashed ${theme.color.green}`,
            cursor: 'pointer'
          }
        },
        'Start'
      ),
      React.createElement(
        'button',
        {
          onClick: () => ns.run('kill.js'),
          style: {
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.color.red,
            borderRadius: theme.spacing.sm,
            border: `1px dashed ${theme.color.red}`,
            cursor: 'pointer'
          }
        },
        'Stop'
      )
    )
  )
}