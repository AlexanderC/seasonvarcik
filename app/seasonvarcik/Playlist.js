export class Playlist {
  constructor(engine, movieId) {
    this.engine = engine;
    this.movieId = movieId;
    this.rawPlaylist = null;
  }

  get episodes() {
    this._ensureFetched();

    return this.rawPlaylist.playlist.map(item => {
      return {
        name: item.comment,
        source: item.file,
      };
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
