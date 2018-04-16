const { MainMenu } = require('electron-menu-plus');
const more = require('./more');
const edit = require('./edit');
 
MainMenu.init();
MainMenu.add(...more);
MainMenu.add(...edit);
