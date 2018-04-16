<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <md-field v-if="!isSelected" class="search" md-clearable>
          <label>Search for a movie, e.g.: Young Sheldon...</label>
          <md-input v-model="query"></md-input>
        </md-field>
        <template v-else>
          <md-button class="md-icon-button" v-on:click="selected = null; playing = null; episodes = null">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
          <span class="md-title">{{ selected.title }}</span>
          <span class="md-title">
            <md-chip
              v-if="selected.votes > 0"
              :class="{ 'low-rating': selected.rating <= 5, 'mid-rating': (selected.rating > 5 && selected.rating <= 8), 'high-rating': selected.rating > 8 }">
              {{ selected.rating }} / {{ selected.votes }}
            </md-chip>
          </span>
        </template>
        <md-progress-bar v-show="progress" md-mode="query" class="md-accent"></md-progress-bar>
      </md-app-toolbar>

      <md-app-drawer v-if="isSelected" md-permanent="clipped" class="md-scrollbar">
        <md-list>
          <md-list-item
            :class="{ 'md-elevation-10': playing === episode }"
            v-for="(episode, index) of episodes"
            :key="episode.url"
            v-on:click="playing = episode">
              <md-icon>movie</md-icon>
              <span class="md-list-item-text">{{ episode.title }}</span>
              <md-tooltip md-direction="right">{{ episode.title }}</md-tooltip>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content v-if="isSelected">
        <video-player v-if="playing" class="video-player-box" ref="videoPlayer"
          :options="{ poster: selected.cover, sources: [{ type: 'video/mp4', src: playing.url }], playbackRates: [ 0.5, 1, 1.5, 2 ], autoplay: true, fluid: true }" :playsinline="true">
        </video-player>
        <md-empty-state v-else
          :md-size="600"
          md-icon="movie"
          md-label="Nothing to Play"
          md-description="Please select an episode to play.">
        </md-empty-state>
      </md-app-content>
      <md-app-content v-else>
        <md-empty-state v-if="!movies || movies.length <= 0"
          :md-size="800"
          md-icon="local_movies"
          md-label="No Movies"
          md-description="Seems like there are no movies matching your request.">
        </md-empty-state>
        <transition-group v-else name="fade" tag="md-content">
          <md-content class="movie-card" v-for="movie in movies" :key="movie.id" v-on:click="select(movie.id)">
            <md-card>
              <md-card-media-cover md-solid md-with-hover>
                <md-card-media md-ratio="4:3">
                  <img :src="movie.cover" :alt="movie.title">
                </md-card-media>

                <md-card-area>
                  <md-card-header>
                    <span class="md-title">{{ movie.title }}</span>
                  </md-card-header>
                </md-card-area>
              </md-card-media-cover>
            </md-card>
          </md-content>
        </transition-group>

        <md-snackbar md-position="center" :md-duration="5000" :md-active.sync="msg" md-persistent>
          <span>{{ msg }}</span>
        </md-snackbar>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import Component from './lib/component';
import debounce from 'debounce';

export default {
  data() {
    return {
      query: null,
      movies: null,
      msg: null,
      progress: true,
      selected: null,
      episodes: null,
      playing: null,
    };
  },
  computed: {
    isSelected() {
      return !!this.selected;
    }
  },
  mounted() {
    this.notifyLoaded('App').catch((error) => {
      this.notify(error.message);
    });
    this.update();
  },
  watch: {
    query(value) {
      if (value && value.trim()) {
        this.update(value);
      }
    },
  },
  methods: Object.assign({
    select(id) {
      this.selected = this.movies.filter(m => m.id === id)[0];
      this.fetchEpisodes(this.selected);
    },
    notify(msg) {
      this.msg = msg;
    },
    fetchEpisodes(movie) {
      this.progress = true;
      
      this.remote('episodes', movie)
        .then((episodes) => {
          this.progress = false;
          this.episodes = episodes;
        })
        .catch((error) => {
          this.progress = false;
          this.notify(error.message);
        });
    },
    update: debounce(function update(query = null) {
      this.progress = true;
      
      this.remote('movies', query)
        .then((movies) => {
          this.progress = false;
          this.movies = movies;
        })
        .catch((error) => {
          this.progress = false;
          this.notify(error.message);
        });
    }, 200),
  }, Component.methods),
};
</script>

<style>
.md-dialog {
  width: 95% !important;
  height: 95% !important;
  max-width: 100% !important;
  max-height: 100% !important;
}

.md-progress-bar {
  width: 100%;
}

input, label {
  color: white !important;
  -webkit-text-fill-color: white !important;
}

input:focus {
  color: white !important;
}

input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
  color: white !important;
}

.md-field:before {
  background-color: transparent !important;
}

.md-field:after {
  background-color: transparent !important;
}

.movie-card {
  width: 300px;
  height: 200px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.md-card {
  width: 100%;
  height: 100%;
}

.md-title {
  font-size: 20px !important;
}

.md-progress-bar {
  background-color: transparent !important;
}

.low-rating {
  background-color: red !important;
  color: white !important;
  text-align: center;
}

.mid-rating {
  background-color: yellow !important;
  color: black !important;
  text-align: center;
}

.high-rating {
  background-color: green !important;
  color: white !important;
  text-align: center;
}

.md-drawer {
  width: 250px;
  max-height: 615px;
}
</style>