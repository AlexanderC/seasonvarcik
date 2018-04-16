const debug = require('debug')('seasonvar:rendition');

module.exports = function rendition(remote) {
  debug('+');

  remote.event('ready', () => {});
  remote.action('component', () => {});
};
