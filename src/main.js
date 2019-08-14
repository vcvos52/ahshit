import Vue from 'vue'
import App from './App.vue'
import io from 'socket.io-client';

export const socket = io();
export const eventBus = new Vue();

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
