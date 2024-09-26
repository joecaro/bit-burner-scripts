import theme from '../theme.js'

/**
 * Creates a styled Grid component.
 * 
 * @param {Object} params - The parameters object.
 * @param {CSSStyleDeclaration} params.style
 * @param {...React.ReactNode} params.children - The children elements.
 * @returns {React.ReactElement} The styled row in React.
 */
export default function Grid({ style, children }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
        ...style
      }
    },
    children
  )
}