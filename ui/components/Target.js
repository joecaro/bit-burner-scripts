import theme from '../theme.js'
import { getProgressColor, formatNumber, htmlStringToReact } from '../utils.js'
import { Label, ProgressBar, Row, Button } from './common.js'
import CollapsibleSection, { handleToggle } from './CollapsibleSection.js'
import { queueEvent } from 'utils/events.js'

/*
 * @param {Object} params - The parameters object.
 * @param {NS} ns params.ns
 * @returns {React.Element} Target Section
*/
const Target = ({ ns }) => {
  const state = JSON.parse(ns.read('state.json'))
  // Fetch server stats
  const minSecurity = ns.getServerMinSecurityLevel(state.target.name);
  const maxMoney = ns.getServerMaxMoney(state.target.name);
  const money = ns.getServerMoneyAvailable(state.target.name)
  const security = ns.getServerSecurityLevel(state.target.name)

  const moneyPercent = money / maxMoney;
  const MAX_SECURITY_DIFFERENCE = 100; // arbitrary
  const securityPercent = (security - minSecurity) / (MAX_SECURITY_DIFFERENCE);

  const TargetHeader = React.createElement(
    Row,
    {
      onClick: () => handleToggle('target-section'),
      style: { cursor: 'pointer' }
    },
    Label({ text: 'Trgt:' }),
    React.createElement(
      'span',
      { style: { color: theme.color.white } },
      state.target.name
    )
  );
  const MoneyHeader = React.createElement(
    Row,
    {},
    Label({ text: 'Money:', style: { paddingLeft: theme.spacing.indent } }),
    React.createElement(
      'span',
      { style: { color: getProgressColor(moneyPercent), paddingLeft: theme.spacing.indent } },
      `${formatNumber(money)}/${formatNumber(maxMoney)}`
    )
  );
  const MoneyPercent = React.createElement(
    Row,
    { style: { paddingLeft: theme.spacing.indent } },
    React.createElement(
      ProgressBar,
      { percent: moneyPercent, length: 15, style: { marginLeft: theme.spacing.indent } }
    )
  );
  const SecurityHeader = React.createElement(
    Row,
    { style: { paddingLeft: theme.spacing.indent } },
    Label({ text: 'Security', style: { paddingLeft: theme.spacing.indent } }),
    React.createElement(
      'span',
      { style: { color: getProgressColor(1 - securityPercent) } },
      `${formatNumber(minSecurity)}/${formatNumber(security)}`
    )
  );
  const SecurityPercent = React.createElement(
    Row,
    { style: { paddingLeft: theme.spacing.indent } },
    React.createElement(
      ProgressBar,
      { percent: securityPercent, length: 15, reverse: true, style: { marginLeft: theme.spacing.indent } }
    )
  );
  const isHacking = ns.scriptRunning('hack.js', 'home')
  const Stage = React.createElement(
    Row,
    { style: { marginLeft: theme.spacing.indent } },
    Label({ text: 'Stage:' }),
    React.createElement(
      'span',
      { style: { color: isHacking ? theme.color.green : theme.color.yellow } },
      isHacking ? 'Hacking' : 'Prepping'
    )
  );

  const hackMultiplier = JSON.parse(ns.read('hack-multiplier.txt'))
  const HackMultiplier = React.createElement(
    Row,
    {
      style: {
        marginLeft: theme.spacing.indent
      }
    },
    Label({ text: "Hck Mltpr:" }),
    React.createElement(
      'span',
      { style: { color: theme.color.white, display: 'flex', gap: theme.spacing.sm } },

      Button({
        text: htmlStringToReact(`<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`),
        onClick: () => queueEvent((ns) => {
          const current = JSON.parse(ns.read('hack-multiplier.txt'))
          ns.write('hack-multiplier.txt', current + 1, 'w')
        }),
        style: {
          height: '20px',
          width: '20px',
          padding: 0
        }
      }),
      Button({
        text: htmlStringToReact(`<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`),
        onClick: () => queueEvent((ns) => {
          ns.write('hack-multiplier.txt', 1, 'w')
        }),
        style: {
          height: '20px',
          width: '20px',
          padding: 0
        }
      }),
      Button({
        text: htmlStringToReact(`<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`),
        onClick: () => queueEvent((ns) => {
          const current = JSON.parse(ns.read('hack-multiplier.txt'))
          ns.write('hack-multiplier.txt', current - 1, 'w')
        }),
        style: {
          height: '20px',
          width: '20px',
          padding: 0
        }
      }),
      hackMultiplier
    ),
  )

  return React.createElement(
    React.Fragment,
    null,
    TargetHeader,
    React.createElement(
      CollapsibleSection,
      { id: 'target-section' },
      MoneyHeader,
      MoneyPercent,
      SecurityHeader,
      SecurityPercent,
      Stage,
      // StageProgress,
      HackMultiplier
    )
  )
}

export default Target;