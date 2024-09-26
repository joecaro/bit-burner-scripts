/** @param {NS} ns */
export async function main(ns) {
  const PORT = 1; // Designated port for state updates
  const portHandle = ns.getPortHandle(PORT);

  // Serialize the updateData to a JSON string
  const message = JSON.stringify({
    host: 'home',
    action: 'reset',
  });

  // Send the message to the port
  if (!portHandle.tryWrite(message)) {
    ns.print(`Error: Port ${PORT} is full. Unable to send state update.`);
  }
}