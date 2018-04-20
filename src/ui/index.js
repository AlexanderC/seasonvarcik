'use strict';

import { shim } from 'object.values';

shim();

import Vue from 'vue';
import VueMaterial from 'vue-material';
import VueVideoPlayer from 'vue-video-player';
import 'video.js/dist/video-js.css';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import 'vue2-animate/dist/vue2-animate.min.css';
import App from './component/app.vue';

Vue.use(VueMaterial);
Vue.use(VueVideoPlayer);

new Vue({
  el: 'app',
  template: '<App/>',
  components: { App },
});
