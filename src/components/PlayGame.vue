<template>
    <div>
        <!-- {{username}} -->
        <!-- {{all}} -->
        <div v-if="gameStarted===false">

            <div v-if="gameEnded===true">
                Some Bitch ass left the game...
            </div>

            In Your Game:
            <div v-for="user in all" v-bind:key="user.name">
                {{user.name}}
            </div>
            <button @click="startGame">Start Game</button>
        </div>

        <div v-if="gameStarted===true">
            <Game v-bind:initializer="first" v-bind:all="all" v-bind:refresh="refresh" v-bind:username="username"/>
        </div>
    </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import axios from "axios";
import {socket} from "../main";
import Game from "./Game"
import { eventBus } from "../main";


export default {
  name: 'Play Game',
  components: {
      Game
  },
  
  data() {
    return{
        all: [],
        gameStarted: false,
        gameEnded: false,
        refresh: false,
        first: false,
    }
  },

  props: {
      username: String,

    },


  created: async function(){

      eventBus.$emit('lobby-started');

      axios.get('/api/online/all').then(res => {
          this.all = res.data;
      });

      axios.get('/isgamestarted').then(data => {
          if (data.data === 'gamestarted'){
            this.refresh = true;
            this.gameStarted = true;
            axios.get('/username')
                .then(res => {
                    this.username = res.data;
                    axios.get('/api/online/getall')
                        .then(res => {this.all = res.data})
                        .catch(err => {console.log("problem getting all")});
                });
        }
      }).catch(err => console.log(err));

  },

  mounted(){

    eventBus.$on('player-joined', user => {
        console.log("PlayGame 70 -- ", this.username, this.all);
        if (!this.gameStarted){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        }
      });

    eventBus.$on('player-left', user => {
        //   this.all.push(data);
        if (this.gameStarted === false){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        } else {
            let included = this.checkInAll(user);
            console.log("PlayGame 83 -- ", user, this.all);
            if (included){
                eventBus.$emit('clear');
            }
        }
      });

    eventBus.$on('start-game', d => {
        if (!this.gameStarted){
            this.gameStarted = true;
            axios.post("/setGameStarted")
                .then(console.log("setGameStarted")).catch(console.log("error on axios call in scoreCard method"));
        }

    });

  },

  methods: {

      checkInAll: function(user){
          for (let i = 0; i < this.all.length; i++){
              let person = this.all[i];
              if (person['name'] === user){
                  return true;
              }
          }
          return false;
      },

      startGame: function(){
          axios.put('/api/online/removeplayers', this.all)
            .then(res => {
                this.gameStarted = true;
                axios.post("/setGameStarted")
                    .then(console.log("good"))
                    .catch(console.log("error on axios call in scoreCard method"));
            })
            .catch(err => {
                console.log(err);
            });
          this.first = true;
          
      }

  },

  beforeDestroy(){

      eventBus.$off('player-joined');

      eventBus.$off('player-left');

      eventBus.$off('start-game');

  },

  destroyed(){

    eventBus.$emit('lobby-ended');

  }

}
</script>


<style>

</style>
