<template>
    <div>
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
            <Game v-bind:all="all" v-bind:refresh="refresh" v-bind:username="username"/>
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
    }
  },

  props: {
      username: String,
    },


  created: async function(){

      axios.get('/api/online/all').then(res => {
          this.all = res.data;
      });

      axios.get('/isgamestarted').then(data => {
          if (data.data === 'gamestarted'){
            this.refresh = true;
            this.gameStarted = true;
        }
      }).catch(err => console.log(err));

  },

  mounted(){

    socket.on('player-joined', user => {
        console.log("PlayGame 70 -- ", this.username, this.all);
        if (!this.gameStarted){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        }
      });

    socket.on('player-left', user => {
        //   this.all.push(data);
        if (this.gameStarted === false){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        } else {
            let included = this.checkInAll(user);
            console.log("PlayGame 83 -- ", this.username, this.all);
            if (included){
                eventBus.$emit('clear');
            }
        }
      });

    socket.on('start-game', d => {
        if (!this.gameStarted){
            this.gameStarted = true;
            axios.post("/setGameStarted")
                .then(console.log("good")).catch(console.log("error on axios call in scoreCard method"));
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
            .catch(err => {
                console.log(err);
            });
          this.first = true;
          socket.emit('start-game', this.username)
      }

  }

}
</script>


<style>

</style>
