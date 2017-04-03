import path from 'path';
import { shell, BrowserWindow } from 'electron';

import installExtensions from './dev';

let launchIpynb;

export function getPath(url) {
  const nUrl = url.substring(url.indexOf('assets'), path.length);
  return path.join(__dirname, '..', nUrl.replace('assets/', ''));
}

export function deferURL(event, url) {
  event.preventDefault();
  if (!url.startsWith('file:')) {
    shell.openExternal(url);
  } else if (url.endsWith('.ipynb')) {
    launchIpynb(getPath(url));
  }
}

const iconPath = path.join(__dirname, '..', '..', 'build', 'icon.png');

const initContextMenu = require('electron-context-menu');

// Setup right-click context menu for all BrowserWindows
initContextMenu();

export function launch(filename) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    icon: iconPath,
    title: 'nteract',
  });

  const index = path.join(__dirname, '..', '..', 'lib', 'app', 'index.html');

  const windowUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : `file://${index}`;

  win.loadURL(windowUrl);

  win.on('ready', installExtensions);

  win.webContents.on('did-finish-load', () => {
    if (filename) {
      win.webContents.send('main:load', filename);
    }
    win.webContents.send('main:load-config');
  });

  win.webContents.on('will-navigate', deferURL);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}
launchIpynb = launch;

export function launchNewNotebook(kernelSpec) {
  const win = launch();
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main:new', kernelSpec);
  });
  return win;
}
