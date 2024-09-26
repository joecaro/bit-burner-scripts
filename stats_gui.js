import { renderToHTMLElement, diffAndUpdate } from './ui/utils.js'
import theme from './ui/theme.js'

import { Row } from './ui/components/common.js'
import User from './ui/components/User.js'
import Target from './ui/components/Target.js'
import Targets from './ui/components/Targets.js'
import Nodes from './ui/components/Nodes.js'

/** @param {NS} ns */
export async function main(ns) {
  /** @type {Document} */
  const doc = eval('document')
  /** @type {HTMLElement} */
  const HUDElement = doc.getElementById("root").firstChild.nextSibling

  try {
    /** @type {HTMLElement | null} */
    let gui = doc.getElementById("gui");

    // CREATE GUI IF IT DOESN'T EXIST
    if (!gui) {
      try {
        const GUI = doc.createElement('div')
        GUI.id = 'gui'
        HUDElement.appendChild(GUI)
        gui = GUI;
      } catch {
        console.error("FAILED TO CREATE GUI")
      }
    } else if (HUDElement.firstChild === gui) {
      // Move the existing gui to the end of the children
      HUDElement.appendChild(gui)
    }


    // UPDATE GUI
    const Header = () => React.createElement(
      Row,
      {
        style: {
          color: theme.color.blue,
          fontSize: theme.size.font.md,
          borderBottom: `1px solid ${theme.color.blue}`,
          fontWeight: 'bold',
          marginBottom: theme.spacing.md,
        }
      },
      "STATS"
    )

    const newDom = renderToHTMLElement(React.createElement(
      'div',
      {
        style: {
          fontFamily: 'arial',
          overflowY: 'scroll',
          height: '100vh',
          backgroundColor: 'rgb(33, 34, 44)'
        }
      },
      React.createElement(Header, { ns }),
      React.createElement(User, { ns }),
      React.createElement(Targets, { ns }),
      React.createElement(Nodes, { ns }),
    ))


    if (!gui.hasChildNodes()) {
      gui.appendChild(newDom);
    } else {
      diffAndUpdate(gui.firstChild, newDom);
    }
  } catch (e) {
    console.error("FAILED TO UPDATE GUI: ", e)
  }

  ns.sleep(500)
}