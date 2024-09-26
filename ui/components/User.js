import theme from '../theme.js'

import { readState } from "utils/state.js";

import { formatNumber } from '../utils.js'

import { Row, Label } from './common.js'

import CollapsibleSection from './CollapsibleSection.js'

const User = ({ ns }) => {
  const hackLvl = ns.getHackingLevel()
  const HackInfo = React.createElement(
    Row,
    {},
    Label({ text: "Hck Lvl:" }),
    React.createElement('span', { style: { color: theme.color.yellow, }, }, hackLvl)
  )

  const money = ns.getServerMoneyAvailable('home');
  const MoneyInfo = React.createElement(
    Row,
    {},
    Label({ text: "Funds:" }),
    React.createElement(
      'span',
      { style: { color: theme.color.green } },
      formatNumber(money)
    )
  );


  const state = readState(ns)
  const now = Date.now();
  const MoneyAquisition = React.createElement(
    Row,
    {},
    Label({ text: "Run $/s:" }),
    React.createElement(
      'span',
      { style: { color: theme.color.blue } },
      `${formatNumber(state.stats.moneyGained / ((now - state.stats.startTime) / 1000))}/sec`
    )
  );

  return React.createElement(
    CollapsibleSection,
    {
      id: 'user-section'
    },
    HackInfo,
    MoneyInfo,
    MoneyAquisition
  )
}

export default User