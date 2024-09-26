
/**
* @param {(ns: NS) => void} ev - Event Callback to add to gloabl queue
*/
export function queueEvent(ev) {
  if (!window.brEventQueue) {
    window.brEventQueue = [];
  }

  window.brEventQueue.push(ev)
}