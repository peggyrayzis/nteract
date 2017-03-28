import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

export default function installExtensions() {
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS),
      installExtension(REDUX_DEVTOOLS)
    ])
    .then(() => console.log('React & Redux Dev Tools successfully installed.'))
    .catch(e => console.log(`Error installing Dev Tools: ${e}`));
    /* eslint-enable no-console */
  }
}
