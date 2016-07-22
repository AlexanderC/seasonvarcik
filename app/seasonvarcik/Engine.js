import {SecurityMark} from './SecurityMark';
import {Playlist} from './Playlist';
import request from 'request';
import Document from 'html-document';
import {exec} from 'child_process';
import {spawn} from 'child_process';

export class Engine {
  constructor(baseUrl = Engine.BASE_URL) {
    this.baseUrl = baseUrl;
    this._securityMark = null;
    this._vlcBinary = null;
    this._initialized = false;
  }

  get vlcBinary() {
    return this._vlcBinary;
  }

  get securityMark() {
    return this._securityMark;
  }

  get autocompleteUrl() {
    return `${this.baseUrl}/autocomplete.php`;
  }

  get autocompleteParam() {
    return 'query';
  }

  playlist(movieId) {
    return new Promise((resolve, reject) => {
      if (!this._initialized) {
        return setTimeout(() => {
          this.playlist(movieId).catch(reject).then(resolve);
        }, 200);
      }

      (new Playlist(this, movieId)).fetch().catch(reject).then(resolve);
    });
  }

  isInitialized() {
    return this._initialized;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this._isInitialized) {
        return resolve(this);
      }

      Promise.all([
        SecurityMark.fetch(this).then(securityMark => {
          this._securityMark = securityMark.toString();
        }),
        this._detectVLC().then(vlcBinary => {
          this._vlcBinary = vlcBinary;
        }),
      ]).catch(reject).then(() => {
        this._initialized = true;
        resolve();
      });
    });
  }

  play(sourceUrl) {
    if (!this._vlcBinary) {
      throw new Error('Missing VLC binaries');
    }

    let episodeProcess = spawn(this._vlcBinary, [sourceUrl]);

    episodeProcess.stdout.pipe(process.stdout);
    episodeProcess.stderr.pipe(process.stderr);

    return episodeProcess;
  }

  _detectVLC() {
    return new Promise((resolve, reject) => {
      exec('find /Applications -iname vlc.app -print -quit', (error, stdout, stderr) => {
        if (error || !stdout.trim()) {
          return reject(new Error(`Missing VLC Player binaries`));
        }

        resolve(stdout.trim() + '/Contents/MacOS/VLC');
      });
    });
  }

  url(path = '') {
    return path.indexOf(this.baseUrl) === 0
      ? path
      : `${this.baseUrl}/${path}`;
  }

  fetch(path = '', isJson = false) {
    return new Promise((resolve, reject) => {
      const url = this.url(path);

      request(url, (error, response, body) => {
        if (error) {
          return reject(`Error while fetching ${url}: ${error.message}`);
        } else if (response.statusCode !== 200) {
          return reject(new Error(`Bad status code ${response.statusCode} for ${url}`));
        }

        try {
          if (isJson) {
            return resolve(JSON.parse(body.toString()));
          }

          const document = new Document();
          document.location = url;
          document.documentElement.innerHTML = body.toString();
          resolve(document);
        } catch (error) {
          return reject(`Error while decoding response from ${url}: ${error.message}`);
        }
      });
    });
  }

  static get BASE_URL() {
    return 'http://seasonvar.ru';
  }
}
