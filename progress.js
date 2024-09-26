/** @param {NS} ns */
export async function main(ns) {
  const minSecurity = ns.args[0];
  const currentSecurity = ns.args[1];
  const maxMoney = ns.args[2];
  const currentMoney = ns.args[3];
  const target = ns.args[4]

  const Smiley = () =>
    React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 100 100', style: { marginRight: '10px' } },
      [
        React.createElement('circle', {
          key: 'face',
          cx: 50,
          cy: 50,
          r: 45,
          fill: 'yellow',
          stroke: 'black',
          strokeWidth: 3,
        }),
        React.createElement('circle', {
          key: 'left-eye',
          cx: 35,
          cy: 40,
          r: 5,
          fill: 'black',
        }),
        React.createElement('circle', {
          key: 'right-eye',
          cx: 65,
          cy: 40,
          r: 5,
          fill: 'black',
        }),
        React.createElement('path', {
          key: 'mouth',
          d: 'M35 60 Q50 75 65 60',
          stroke: 'black',
          strokeWidth: 3,
          fill: 'transparent',
        }),
      ]
    );

  const ProgressBar = (label, value, max) =>
    React.createElement(
      'div',
      { style: { width: '100%', margin: '5px 0' } },
      React.createElement('span', {}, `${label}: ${value} / ${max}`),
      React.createElement('div', {
        style: {
          backgroundColor: '#444',
          borderRadius: '10px',
          width: '100%',
          height: '20px',
          overflow: 'hidden',
          marginTop: '5px',
        }
      },
        React.createElement('div', {
          style: {
            backgroundColor: getProgressColor((value / max)),
            width: `${(value / max) * 100}%`,
            height: '100%',
          },
        })
      ));

  ns.tprintRaw(React.createElement(
    'div',
    { style: { backgroundColor: '#555', borderRadius: '20px', width: 'fit-content', margin: '0 20px', padding: '10px' } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
      Smiley(),
      React.createElement(
        'div',
        { style: { width: '400px', marginLeft: '10px' } },
        ProgressBar('Security', currentSecurity - minSecurity, 50 - minSecurity),
        ProgressBar('Money', currentMoney, maxMoney)
      )
    )
  ));

  ns.toast(`Security: ${currentSecurity} / Money: ${currentMoney}`);
}


/**
 * @param {number} percentage - A number between 0 and 1, representing the progress percentage.
 * @returns {string} A color string in the format 'rgb(r, g, b)' transitioning from red to green.
 */
function getProgressColor(percentage) {
  const red = percentage < .5 ? 255 :Math.floor(255 * (1 - percentage / 2));
  const green = percentage > .5 ? 255 : Math.floor(255 * percentage * 2);
  return `rgb(${red}, ${green}, 0)`;
}