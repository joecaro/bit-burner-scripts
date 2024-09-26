/** @param {NS} ns */
export async function main(ns) {
  const files = ns.ls('home')
  // Initial state
  let currentDir = '/';
  let currentPath = []
  let runningScript = null;
  let progress = 0;
  let isSimulatingProgress = false;
  let isRunning = true;

  // Function to render the UI based on current state
  function renderUI() {
    // Clear the terminal for re-rendering
    ns.ui.clearTerminal();

    const itemsToRender = [];

    files.forEach(file => {
      if (fileIsInCurrentDir({ currentPath, file })) {
        itemsToRender.push(file)
      } else {
        const subDir = getNextPath(currentPath, file)

        if (subDir && !itemsToRender.includes(subDir)) {
          itemsToRender.push(subDir)
        }
      }
    })

    ns.tprintRaw(React.createElement(
      'div',
      { style: { backgroundColor: '#555', borderRadius: '20px', width: 'calc(100% - 100px)', margin: '0 20px', padding: '20px' } },
      KillButton({ onClick: handleClose }),
      Header({ currentDir }),
      BackButton({ currentDir, handleClick: handleBack }),
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', flexWrap: 'wrap', maxHeight: '500px' } },
        Items({ handleClick, currentPath, files: itemsToRender })
      ),
      SimButton({ isSimulatingProgress, simulateProgress }),
      ProgressBar({ progress }),

    ))

  }

  // Simulate progress bar
  async function simulateProgress() {
    progress = 0; // Reset progress
    isSimulatingProgress = true;
  }

  // Handle clicks on directories and scripts
  function handleClick(item) {
    if (item.endsWith('/')) {
      // It's a directory, navigate into it
      currentDir = currentDir + item;
    } else {
      // It's a script, run it
      runningScript = item;
      ns.exec(item, 'home'); // Run the script on 'home'
    }
  }

  // Handle back navigation
  function handleBack() {
    // Go up one level in the directory structure
    const parentDir = currentDir.substring(0, currentDir.lastIndexOf('/', currentDir.length - 2) + 1);
    currentDir = parentDir || '/';
  }

  function handleClose() {
    isRunning = false
  }

  // Main loop to keep the UI alive and updated
  while (isRunning) {
    if (isSimulatingProgress) {
      if (progress < 100) {
        progress = progress + 1;
      } else {
        isSimulatingProgress = false;
      }
    }
    renderUI(); // Always render UI
    await ns.sleep(100)
  }

  // clear terminal after close
  ns.ui.clearTerminal();
}

// @param { onClick: () => void } props
const KillButton = ({ onClick }) => React.createElement(
  'button',
  { onClick },
  'Close'
)

// @param { currentDir: string } props
const Header = ({ currentDir }) => React.createElement('div', null, [
  React.createElement('h3', { key: 'header' }, 'File System GUI'),
  React.createElement('div', { key: 'currentDir' }, `Current Directory: ${currentDir}`),
]);

// @param { handleClick: (item: string) => void, currentPath: string, files: string[]} props
const Items = ({ handleClick, currentPath, files }) => files.map((file) => {
  return React.createElement('div', {
    key: file,
    style: { padding: '5px', cursor: 'pointer', color: file.endsWith('/') ? '#ddd' : '#fff' },
    onClick: () => handleClick(file),
  }, file.endsWith('/') ? file : getFileName(file))
})
// @param { currentDir: string, handleClick: () => void } props
const BackButton = ({ currentDir, handleClick }) => {
  if (currentDir !== '/') {
    return React.createElement('button', {
      onClick: handleClick,
      style: { marginTop: '10px', cursor: 'pointer' }
    }, 'Back')
  }
}
// @param { isSimulatingProgress: boolean, simulateProgress: () => void } props
const SimButton = ({ isSimulatingProgress, simulateProgress }) => {
  if (!isSimulatingProgress) {
    return React.createElement('button', {
      onClick: simulateProgress,
      style: { marginTop: '10px', cursor: 'pointer' }
    }, 'Simulate Progress')
  }
}

// @param { runningScript: string } props
const RunningScript = ({ runningScript }) => {
  if (runningScript) {
    React.createElement('div', { style: { marginTop: '10px' } }, `Running Script: ${runningScript}`);
  }
}
// @param { progress: number } props
const ProgressBar = ({ progress }) => {
  const progressColor = `rgb(${Math.max(Math.floor((-2 * (progress / 100) + 1) * 255), 0)}, ${Math.min(
    Math.floor(2 * (progress / 100) * 255),
    255
  )}, 0)`;

  return React.createElement('div', { style: { width: '100%', backgroundColor: '#ddd', borderRadius: '10px', padding: '3px' } },
    React.createElement('div', {
      style: {
        width: `${progress}%`,
        height: '20px',
        backgroundColor: progressColor,
        borderRadius: '10px',
      },
    })
  )
}
// @param { currentPath: string[], file: string } props
function fileIsInCurrentDir({ currentPath, file }) {
  const splitPathToDir = file.split('/').filter(Boolean).slice(0, -1)
  const inCurrentDir = splitPathToDir.length === currentPath.length && splitPathToDir.every((dir, i) => dir === currentPath[i])

  return inCurrentDir;
}

function fileToPathArray(file) {
  return file.split('/').filter(Boolean)
}

function getNextPath(currentPath, file) {
  const filePath = fileToPathArray(file)

  if (currentPath.every((p, i) => p === file[i] && filePath.length === currentPath.length + 2)) {
    return `${currentPath[currentPath.length - 1]}/`
  }

  return null;
}

function getFileName(file) {
  return fileToPathArray(file).filter(Boolean).slice(-1)[0]
}