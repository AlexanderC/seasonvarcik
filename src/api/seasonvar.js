const debug = require('debug')('seasonvar:api');
const Seasonvar = require('seasonvar-api-nokey/es5');
const Movie = require('seasonvar-api-nokey/es5/movie');

module.exports = function seasonvar(remote) {
  debug('+');

  const seasonvar = Seasonvar.create();

  remote.action('movies', (query = null) => {
    return query ? seasonvar.autocomplete(query) : seasonvar.top();
  });

  remote.action('episodes', (movie) => {
    return seasonvar.episodes(new Movie(seasonvar.client, movie));
  });
};
