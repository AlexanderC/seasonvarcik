import {SecurityMark} from './SecurityMark';
import {Playlist} from './Playlist';
import request from 'request';
import Document from 'html-document';

export class Engine {
  constructor(baseUrl = Engine.BASE_URL) {
    this.baseUrl = baseUrl;
    this._securityMark = null;
    this._initialized = false;
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

      SecurityMark.fetch(this).catch(reject).then(securityMark => {
        this._securityMark = securityMark.toString();
        this._initialized = true;

        resolve(this);
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
