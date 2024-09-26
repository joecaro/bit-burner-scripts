/**
 * Renders the collapsible section content.
 * 
 * @param {string} id - Unique identifier for the section.
 * @param {boolean} isOpen - Whether the section is open.
 * @param {React.ReactNode} children - The content to display.
 * @returns {React.ReactElement} The collapsible content element.
 */
function CollapsibleSection({ id, children }) {
  return React.createElement(
    'div',
    {
      id: `${id}`,
      style: {
        overflow: 'hidden',
        transition: 'height 0.3s ease',
        height: 'auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }
    },
    children
  );
}

export default CollapsibleSection;

export function handleToggle(id) {
  try {
    const el = document.getElementById(id)
    el.style.height = el.style.height === 'auto' ? '1px' : 'auto'
  } catch {
    console.log("COULD NOT TOGGLE SECTION: ", id)
  }
}