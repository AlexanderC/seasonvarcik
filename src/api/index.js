const { ipcMain } = require('electron');
const { Socket, Transport } = require('electron-ipc-socket');
const debug = require('debug')('seasonvar:socket');
const seasonvar = require('./seasonvar');
const rendition = require('./rendition');

class Api {
  /**
   * @param {BrowserWindow} screen 
   */
  constructor(screen) {
    this.screen = screen;

    debug('init', Api.CHANNEL);

    this.socket = Socket(
      Api.CHANNEL,
      Transport(ipcMain, screen)
    );
  }

  register() {
    debug('register');

    seasonvar(this);
    rendition(this);

    return this;
  }

  /**
   * @param {string} name 
   * @param {Function} handler 
   */
  event(name, handler) {
    this.socket.on(`event:${ name }`, (data) => {
      debug('event', name, data);

      handler(JSON.parse(data));
    });
  }

  /**
   * @param {string} name 
   * @param {Function} handler 
   */
  action(name, handler) {
    this.socket.on(`message:${ name }`, (msg) => {
      debug('message', name, msg.data());

      const reply = (response) => {
        response = JSON.stringify(response);

        debug('response', response);
        msg.reply(response);
      };

      try {
        const response = handler(JSON.parse(msg.data()));

        if (response 
          && typeof response === 'object'
          && response instanceof Promise) {
          
          response.then((data) => {
            reply({ data, error: null });
          }).catch((error) => {
            reply({ data: null, error: error.message });
          });
        } else {
          reply({ error: null, data: response });
        }
      } catch (error) {
        reply({ data: null, error: error.message });
      }
    });
  }

  /**
   * @param {bool} register 
   */
  open(register = true) {
    debug('open');

    if (register) {
      this.register();
    }

    this.socket.open();

    return this;
  }

  close() {
    debug('close');

    this.socket.close();

    return this;
  }

  static get CHANNEL() {
    return 'api';
  }
}

module.exports = Api;
