import mktemp from 'mktemp';
import fs from 'fs';
import os from 'os';

export class Playlist {
  constructor(engine, movieId) {
    this.engine = engine;
    this.movieId = movieId;
    this.rawPlaylist = null;
  }

  get episodes() {
    this._ensureFetched();

    return this.rawPlaylist.playlist.map(item => {
      let titleParts = item.comment.split('<br>');
      let title = titleParts[0];

      if (titleParts.length > 1) {
        title += ` [${titleParts[1]}]`;
      }

      return {
        name: title,
        source: item.file,
      };
    });
  }

  createPls(...episodes) {
    return new Promise((resolve, reject) => {
      episodes = episodes.length <= 0 ? this.episodes : episodes;

      mktemp.createFile(`${os.tmpdir()}/${this.movieId}-XXXXX.pls`).catch(reject)
        .then(plsPath => {
          let plsContent = `[playlist]

NumberOfEntries=${episodes.length}
`;

          episodes.forEach((episode, i) => {
            plsContent += `
File${i + 1}=${episode.source}
Title${i + 1}=${episode.name}
`;
          });

          fs.writeFile(plsPath, plsContent, error => {
            error ? reject(error) : resolve(plsPath);
          });
        });
    });
  }

  fetch() {
    return new Promise((resolve, reject) => {
      this.engine.fetch(this.path, true).catch(reject).then(rawPlaylist => {
        this.rawPlaylist = rawPlaylist;
        resolve(this);
      });
    });
  }

  _ensureFetched() {
    if (!this.rawPlaylist) {
      throw new Error('You must call fetch() first');
    }
  }

  get path() {
    return `playls2/${this.engine.securityMark}/trans/${this.movieId}/list.xml`;
  }
}
