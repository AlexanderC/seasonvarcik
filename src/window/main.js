const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');
const config = require('../../package.json').electron;

module.exports = function main() {  
  const screen = new BrowserWindow({
    width: 1280,
    height: 750, 
    icon: path.join(__dirname, '../../resources/Icon.ico'),
    title: config.title,
    resizable: false,
    maximizable: false,
  });

  screen.loadURL(url.format({
    pathname: path.join(__dirname, 'view/main.html'),
    protocol: 'file:',
    slashes: true,
  }));
  screen.on('closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  return screen;
};
