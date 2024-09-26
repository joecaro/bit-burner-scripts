// List of SVG element names
const SVG_ELEMENTS = new Set([
  'svg', 'path', 'circle', 'rect', 'polygon', 'line', 'ellipse', 'g',
  'defs', 'clipPath', 'text', 'tspan', 'use', 'symbol', 'linearGradient',
  'radialGradient', 'stop', 'marker', 'pattern', 'mask', 'filter', 'image',
  // Add more SVG elements as needed
]);

// SVG Namespace URL
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Renders a React element to an actual HTMLElement.
 * 
 * @param {ReactElement} element - React element created by React.createElement
 * @returns {HTMLElement} - DOM element
 */
export function renderToHTMLElement(element) {
  if (element === null) {
    return null;
  }

  if (typeof element === 'string' || typeof element === 'number') {
    return document.createTextNode(element); // Handle text nodes
  }

  // Handle functional components
  if (typeof element.type === 'function') {
    // Call the functional component to get the rendered result
    const renderedElement = element.type(element.props);
    return renderToHTMLElement(renderedElement); // Recursively render the result
  }

  // Handle React.Fragment by returning a DocumentFragment
  if (element.type === React.Fragment) {
    const fragment = document.createDocumentFragment();
    const children = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children];

    children.forEach(child => {
      fragment.appendChild(renderToHTMLElement(child));
    });
    return fragment;
  }

  const { type, props } = element;

  // Determine if the element is an SVG element
  const isSVG = SVG_ELEMENTS.has(type);

  // Create element with the appropriate namespace
  const domNode = isSVG
    ? document.createElementNS(SVG_NAMESPACE, type)
    : document.createElement(type);

  // Store props in a custom property to access during diffing (e.g., __reactProps)
  domNode.__reactProps = props;


  // Set attributes and properties (excluding event listeners and children)
  Object.entries(props || {}).forEach(([key, value]) => {
    if (key === 'children') return; // Skip children

    if (/^on[A-Z]/.test(key)) {
      // Attach event listeners
      const eventType = key.toLowerCase().substring(2); // Extract event type from "onClick"
      domNode.addEventListener(eventType, value);
    } else if (key === 'style') {
      // Handle inline styles
      Object.assign(domNode.style, value);
    } else {
      // Set other attributes
      domNode.setAttribute(convertPropToAttr(key), value);
    }
  });

  // Recursively render children and append to the node
  const children = Array.isArray(props?.children)
    ? props.children
    : [props?.children || ''];

  children.forEach(child => {
    const childNode = renderToHTMLElement(child)
    childNode && domNode.appendChild(childNode);
  });

  return domNode;
}

/**
 * Diff the existing DOM node versus the new one and selectively update.
 * 
 * @param {Node} oldNode - The current live DOM node.
 * @param {Node} newNode - The new virtual DOM node.
 */
export function diffAndUpdate(oldNode, newNode) {
  // If newNode is undefined or null, remove oldNode from the DOM
  if (!newNode) {
    oldNode.remove();
    return;
  }

  // If node types are different, replace the old node entirely
  if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
    oldNode.replaceWith(newNode);
    return;
  }

  // Handle text nodes
  if (oldNode.nodeType === Node.TEXT_NODE && oldNode.textContent !== newNode.textContent) {
    oldNode.textContent = newNode.textContent;
    return;
  }

  // Update attributes for element nodes
  if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
    updateAttributes(oldNode, newNode);

    // Handle event listeners
    updateEventListeners(oldNode, newNode);
  }


  // Recursively diff and update child nodes
  const oldChildren = Array.from(oldNode.childNodes);
  const newChildren = Array.from(newNode.childNodes);

  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!oldChild && newChild) {
      // If new child exists and old child doesn't, append the new child
      oldNode.appendChild(newChild);
    } else if (oldChild && !newChild) {
      // If old child exists but new child doesn't, remove the old child
      oldChild.remove();
    } else if (oldChild && newChild) {
      // Recursively diff and update existing children
      diffAndUpdate(oldChild, newChild);
    }
  }
}

/**
 * Updates the attributes of oldNode to match those of newNode.
 * 
 * @param {HTMLElement} oldNode - The current live DOM node.
 * @param {HTMLElement} newNode - The new virtual DOM node.
 */
function updateAttributes(oldNode, newNode) {
  // Get all attributes from both nodes
  const oldAttrs = Array.from(oldNode.attributes);
  const newAttrs = Array.from(newNode.attributes);

  // Remove attributes that are no longer present in newNode
  oldAttrs.forEach(attr => {
    if (!newNode.hasAttribute(attr.name)) {
      oldNode.removeAttribute(attr.name);
    }
  });

  // Add or update attributes present in newNode
  newAttrs.forEach(attr => {
    if (oldNode.getAttribute(attr.name) !== attr.value) {
      oldNode.setAttribute(attr.name, attr.value);
    }
  });

  // Handle special cases for class and style attributes
  if (newNode.hasAttribute('class')) {
    oldNode.className = newNode.getAttribute('class');
  }
  if (newNode.hasAttribute('style') && newNode.getAttribute('style') !== oldNode.getAttribute("style")) {
    const newStyles = newNode.getAttribute('style');
    oldNode.setAttribute('style', newStyles);
  }
}

/**
 * Updates event listeners on oldNode to match those on newNode.
 * 
 * @param {HTMLElement} oldNode - The current live DOM node.
 * @param {HTMLElement} newNode - The new virtual DOM node.
 */
function updateEventListeners(oldNode, newNode) {
  // Remove old event listeners
  Object.entries(oldNode.__eventListeners || {}).forEach(([eventType, listener]) => {
    oldNode.removeEventListener(eventType, listener);
  });

  // Attach new event listeners
  Object.entries(newNode.__reactProps || {}).forEach(([key, value]) => {
    if (key.startsWith('on')) {
      const eventType = key.slice(2).toLowerCase(); // e.g., onClick -> click
      oldNode.addEventListener(eventType, value);

      // Store the listener in a custom property for future removal
      if (!oldNode.__eventListeners) {
        oldNode.__eventListeners = {};
      }
      oldNode.__eventListeners[eventType] = value;
    }
  });
}

/**
 * Helper function to convert React prop names to HTML attribute names.
 * (Handles common React prop/HTML differences like "className" -> "class")
 * 
 * @param {string} propName - React prop name
 * @returns {string} - HTML attribute name
 */
export function convertPropToAttr(propName) {
  // Mapping of React props to DOM/SVG attributes
  const attributeMap = {
    // SVG Attributes
    "viewBox": "viewBox",
    "strokeWidth": "stroke-width",
    "strokeLinecap": "stroke-linecap",
    "strokeLinejoin": "stroke-linejoin",
    "fillOpacity": "fill-opacity",
    "clipPath": "clip-path",
    // React-specific attribute mappings
    "className": "class",
    "htmlFor": "for",
    // Add more mappings as needed
  };

  // If the prop exists in the map, return the mapped value
  if (attributeMap[propName]) {
    return attributeMap[propName];
  }


  if (propName === 'className') {
    return 'class';
  } else if (propName === 'htmlFor') {
    return 'for';
  }
  return propName;
}


/**
 * Converts a CSSStyleDeclaration-like object to an inline style string.
 * 
 * @param {CSSStyleDeclaration | Object} style - The CSSStyleDeclaration or style object.
 * @returns {string} The inline style string.
 */
export function cssStyleToInlineString(style) {
  return Object.keys(style)
    .map(key => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${style[key]};`)
    .join(' ')
}

/**
 * Formats a number to a 4 character or less string.
 * 
 * @param {number} num - The number to format.
 * @param {number} decimals - The number to format.
 * @returns {string} The formatted number string.
 */
export function formatNumber(num, decimals = 2) {
  let formattedNum = num;
  const units = ['', 'k', 'm', 'b', 't', 'p'];
  let unitIndex = 0;

  while (formattedNum >= 1000 && unitIndex < units.length - 1) {
    formattedNum /= 1000;
    unitIndex++;
  }

  return formattedNum.toFixed(decimals) + units[unitIndex];
}

/**
 * Formats a ms to time string
 * 
 * @param {number} ms - The time in ms.
 * @returns {string} The formatted time string.
 */
export function formatTimeStringMS(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${toSec(ms)}s`;
  } else if (ms < 3600000) { // corrected to 1 hour (3600000 ms)
    return `${toMin(ms)}m ${toSec(ms) % 60}s`;
  } else {
    return `${toHour(ms)}h ${toMin(ms) % 60}m ${toSec(ms) % 60}s`;
  }
}

const toSec = (ms) => Math.floor(ms / 1000);
const toMin = (ms) => Math.floor(ms / 1000 / 60);
const toHour = (ms) => Math.floor(ms / 1000 / 60 / 60);



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

/**
 * Converts an HTML string to React elements.
 *
 * @param {string} htmlString - The HTML string to convert.
 * @returns {React.ReactNode} - The resulting React elements.
 */
export function htmlStringToReact(htmlString) {
  // Create a new DOMParser instance
  const parser = new DOMParser();

  // Parse the HTML string into a Document
  const doc = parser.parseFromString(htmlString, 'text/html');

  /**
   * Recursively converts a DOM node to a React element.
   *
   * @param {Node} node - The DOM node to convert.
   * @returns {React.ReactNode} - The resulting React element or text.
   */
  function convertNode(node) {
    // If the node is a text node, return its text content
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    // If the node is an element node, process it
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node;

      // Extract the tag name
      const tagName = element.tagName.toLowerCase();

      // Extract attributes
      const attributes = {};
      for (let attr of element.attributes) {
        // Convert attribute names to camelCase for React
        const attrName = attr.name === 'class' ? 'className' :
          attr.name === 'for' ? 'htmlFor' :
            attr.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        attributes[attrName] = attr.value;
      }

      // Recursively convert child nodes
      const children = [];
      node.childNodes.forEach((child) => {
        const convertedChild = convertNode(child);
        if (convertedChild !== null && convertedChild !== undefined) {
          children.push(convertedChild);
        }
      });

      const reactNode = React.createElement(tagName, attributes, ...children)


      return reactNode;
    }

    // For other node types (e.g., comments), return null
    return null;
  }

  // Start conversion from the body of the parsed document
  const reactElements = [];
  doc.body.childNodes.forEach((node) => {
    const converted = convertNode(node);
    if (converted !== null && converted !== undefined) {
      reactElements.push(converted);
    }
  });

  // If there's only one root element, return it directly
  if (reactElements.length === 1) {
    return reactElements[0];
  }

  // Otherwise, return an array of elements
  return reactElements;
}