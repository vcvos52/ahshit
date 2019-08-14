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
            <Game v-bind:all="all"/>
        </div>
    </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import axios from "axios";
import {socket} from "../main";
import Game from "./Game"


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
    }
  },

  props: {
      username: String,
    },


  created: async function(){

      axios.get('/api/online/all').then(res => {
          this.all = res.data;
      })

  },

  mounted(){

    socket.on('player-joined', d => {
        //   this.all.push(data);
        axios.get('/api/online/all').then(res => {
            this.all = res.data;
            });
      });

    socket.on('player-left', d => {
        //   this.all.push(data);
        if (this.gameStarted === false){
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        } else {
            axios.put('/api/online/addplayers', this.all).catch(err => {console.log(err)});
            this.gameEnded = true;
            this.gameStarted = false;
            axios.get('/api/online/all').then(res => {
                this.all = res.data;
                });
        }
      });

    socket.on('start-game', d => {
        this.gameStarted = true;
    });

  },

  methods: {

      startGame: function(){
          axios.put('/api/online/removeplayers', this.all)
            .catch(err => {
                console.log(err);
            })
          socket.emit('start-game', this.username)
      }

  }

}
</script>


<style>

</style>
