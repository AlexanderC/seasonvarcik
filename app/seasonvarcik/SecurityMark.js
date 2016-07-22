export class SecurityMark {
  constructor(rawSecurityMark) {
    this.rawSecurityMark = rawSecurityMark;
  }

  toString() {
    return this.rawSecurityMark + '0';
  }

  static _fetchSecurityMarkStack(engine, films) {
    return new Promise((resolve, reject) => {
      if (films.length <= 0) {
        return reject(new Error('Unable to find any security mark'));
      }

      const moviePath = films.shift();

      engine.fetch(moviePath).catch(error => {
        SecurityMark._fetchSecurityMarkStack(engine, films).catch(reject).then(resolve);
      }).then(moviePage => {
        try {
          const rawSecurityMark = moviePage.body.textContent
            .match(/var\s+secureMark\s*=\s*"([^"]+)";/)[1];

          if (!rawSecurityMark) {
            throw new Error(`Unable to find security mark on page ${moviePath}`);
          }

          resolve(rawSecurityMark);
        } catch (e) {
          SecurityMark._fetchSecurityMarkStack(engine, films).catch(reject).then(resolve);
        }
      });
    });
  }

  static fetch(engine) {
    return new Promise((resolve, reject) => {
      engine.fetch().catch(reject).then(mainPage => {
        let films = mainPage.body.querySelectorAll('div.film-list-item');

        if (films.length <= 0) {
          return reject(new Error('There are no films available'));
        }

        SecurityMark._fetchSecurityMarkStack(
          engine,
          films.map(movie => movie.querySelector('a').href)
        ).catch(reject).then(rawSecurityMark => {
          if (!rawSecurityMark) {
            return reject(new Error('Unable to fetch security mark'));
          }

          resolve(new SecurityMark(rawSecurityMark.toString()));
        });
      });
    });
  }
}
