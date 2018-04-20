const { BrowserWindow, shell } = require('electron');
const path = require('path');
const url = require('url');
const pkg = require('../../package.json');

module.exports = [
  'More',
  [
    {
      label: '🍺 Buy me a beer',
      click () {
        const screen = new BrowserWindow({
          width: 300, height: 270,
          titleBarStyle: 'hidden',
          title: 'Donate',
          icon: path.join(__dirname, '../../resources/Icon.ico'),
        });
        screen.setTitle('Donate');
        screen.setMenu(null);
        screen.loadURL(url.format({
          pathname: path.join(__dirname, 'view/donate.html'),
          protocol: 'file:',
          slashes: true,
        }));
      },
    },
    { type: 'separator' },
    { label: 'Developer Tools', role: 'toggledevtools' },
    {
      label: 'About',
      click () {
        shell.openExternal(pkg.homepage);
      },
    },
  ],
];
