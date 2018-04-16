'use strict';

const path = require('path');

// If development
if (process.env.npm_package_scripts_start) {
  process.env.DEBUG = 'seasonvar:*';

  require('electron-reload')(path.join(__dirname, '..'), {
    ignored: /node_modules|[\/\\]\./,
    electron: path.join(__dirname, 'node_modules/.bin/electron'),
  });
}

const { app } = require('electron');
const main = require('./window/main');
const Api = require('./api');

require('./menu');

 // This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const screen = main();
  
  new Api(screen).open();
});

// @todo handle this properly
process
  .on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  })
  .on('uncaughtException', (error) => {
    console.error(error);
    process.exit(1);
  });

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
