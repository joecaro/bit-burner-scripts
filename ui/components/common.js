import theme from '../theme.js'

/**
 * Creates a styled row (flex container) component.
 * 
 * @param {Object} props - The parameters object.
 * @param {CSSStyleDeclaration} props.style
 * @param {...React.ReactNode} props.children - The children elements.
 * @returns {React.ReactElement} The styled row in React.
 */
export function Row({ style, children, ...rest }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        ...style
      },
      ...rest
    },
    children
  );
}

/**
 * Creates a styled label component.
 * 
 * @param {{text: string, color?: string, indent?: number, style?: CSSStyleDeclaration }} props - The parameters for the label component.
 * @returns {React.ReactElement} The styled label in React.
 */
export function Label({ text, color = theme.color.white, style, indent = 0 }) {
  return React.createElement(
    'span',
    {
      style: {
        color: color,
        fontSize: theme.size.font.sm,
        paddingLeft: `${theme.spacing.numbers.indent * indent}px`,
        fontWeight: 'bold',
        ...style
      }
    },
    text
  );
}


/**
 * Creates a text-based progress bar.
 * 
 * @param {Object} params - The parameters object.
 * @param {number} params.percent - The completion percentage (0-100).
 * @param {number} params.length - The total number of characters for the progress bar.
 * @param {Object} [params.style] - Optional style object for the progress bar.
 * @param {boolean} [params.reverse=false] - Optional flag to reverse the progress bar direction.
 * @returns {React.Element} The text-based progress bar.
 */
export function ProgressBar({ percent, length, style, reverse = false }) {
  const doneLength = Math.round((percent) * length)
  const notDoneLength = length - doneLength
  const color = getProgressColor(reverse ? 1 - percent : percent)

  // Create the done part using full blocks
  const donePart = '█'.repeat(doneLength)

  // Create the not done part where the first not-done block is medium density
  const notDonePart = notDoneLength > 0
    ? '▒' + '░'.repeat(notDoneLength - 1)
    : ''

  return React.createElement(
    'div',
    { style: { color, display: 'flex', gap: '4px', ...style } },
    ...donePart.split("").map(x => React.createElement('span', {}, x)),
    ...notDonePart.split("").map(x => React.createElement('span', {}, x))
  )
}

/**
 * Creates a base styled button.
 * 
 * @param {Object} params - The parameters object.
 * @param {NS} ns - ns instance
 * @param {string} params.text - button text
 * @param {(ns: NS) => void)} params.onClick - click cb
 * @param {Object} [params.style] - Optional style object for the button.
 * @returns {React.Element} The text-based progress bar.
 */
export function Button({ text, onClick, style, }) {
  return React.createElement(
    'button',
    {
      style: {
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        backgroundColor: theme.color.green,
        borderRadius: theme.spacing.sm,
        border: `1px dashed ${theme.color.green}`,
        cursor: 'pointer',
        ...style
      },
      onClick: onClick
    },
    text
  )
}

/**
 * Returns an RGB color based on the completion percentage.
 * 
 * @param {number} percent - The completion percentage (0-100).
 * @returns {string} The RGB color as a string in the form of 'rgb(r, g, b)'.
 */
export function getProgressColor(percent) {
  let r, g

  if (percent < .5) {
    // Transition from red to yellow (50% red, increasing green)
    r = 255
    g = Math.floor((percent * 100 / 50) * 255)
  } else {
    // Transition from yellow to green (decreasing red, 100% green)
    r = Math.floor(255 - ((percent * 100 - 50) / 50) * 255)
    g = 255
  }

  const b = 0 // No blue in red-orange-yellow-green gradient

  return `rgb(${r}, ${g}, ${b})`
}


