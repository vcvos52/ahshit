<template>
    <div>
        <!-- Present the game lobby before someone starts -->
        <div v-if="gameStarted===false">

            <div v-if="gameEnded===true">
                Some one left the game...
            </div>

            <span style="color:white">In Your Game:</span>
            <div style="color:white" v-for="user in all" v-bind:key="user.name">
                {{user.name}}
            </div>
            <button id="button2" style="margin-top:10px" @click="startGame">Start Game</button>
        </div>

        <!-- Game has been started -->
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

      // Send info of player joining the lobby to others
      eventBus.$emit('lobby-started');

      // gets all the people waiting to play
      axios.get('/api/online/all').then(res => {
          this.all = res.data;
      });

      // Method to help with refreshing.. sets game open if session data says so
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

    // Listens for someone else joining the lobby
    eventBus.$on('player-joined', user => {
        console.log("PlayGame 70 -- ", this.username, this.all);
        if (!this.gameStarted){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        }
      });

    // listens for player leaving the lobby
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

    // Game has been started, go play.
    eventBus.$on('start-game', d => {
        if (!this.gameStarted){
            this.gameStarted = true;
            axios.post("/setGameStarted")
                .then(console.log("setGameStarted")).catch(console.log("error on axios call in scoreCard method"));
        }

    });

  },

  methods: {

      /**
       * Helper function: checks if socket data comes from user in game
       */
      checkInAll: function(user){
          for (let i = 0; i < this.all.length; i++){
              let person = this.all[i];
              if (person['name'] === user){
                  return true;
              }
          }
          return false;
      },

      /**
       * Starts the game and sends the communication to all of the other players
       */
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
