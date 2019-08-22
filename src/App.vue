<template>
  <div id="app">
      <button style="margin:10px" @click="clearSession">Start Over</button>
      <div style="width:75%; margin:auto" v-if="init===true">
        <button id="button1" @click="scoreCard">Score Card</button>
        <button id="button1" @click="playGame">Play Game</button>
      </div>

      <div v-else-if="scorecard===true">
        <ScoreCard/>
      </div>

      <div v-else-if="playgame===true">
        <div v-if="gogogo===false">
          <input type="text" v-model="username"><br><br>
          <input style="width:70px" type="button" @click="entername" id="funny" v-bind:value="username">
        </div>
        <PlayGame v-bind:username="username" v-if="gogogo===true"/>
      </div>

  </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import ScoreCard from "./components/ScoreCard.vue";
import PlayGame from "./components/PlayGame.vue";
import axios from "axios";
import {socket} from "./main"
import { eventBus } from "./main";


export default {
  name: 'app',
  components: {
    ScoreCard,
    PlayGame
  },
  
  data() {
    return{
      init: false,
      scorecard: false,
      playgame: false,
      gogogo: false,
      username: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  },


  created: async function(){

    axios.get('/connected').then(res => {
      console.log(res.data);
      if (res.data === 'no'){
        console.log("CONNECTING");
        socket.connect();
        axios.post('/connect').then(console.log("connected")).catch("something wrong with connect api call");
      }
    })
    
    /**
     * Checks if the user is currently signed in
     * This decided what HTML elements to render
     */
    axios.get("/isSigned")
      .then((data) => {
        if (data.data === 'scorecard'){
          this.scorecard = true;
          this.init = false;
          this.playgame = false;
        } else if (data.data === 'playgame'){
          this.playgame = true;
          this.init = false;
          this.scorecard = false;
        } else if (data.data === 'gogogo'){
          this.playgame = true;
          this.init = false;
          this.scorecard = false;
          this.gogogo = true;
        }
      })
      .catch(() => {
        this.init = true;
        this.scorecard = false;
        this.playgame = false;
      });

      eventBus.$on("clear", () => {
        axios.delete(`/clearSession/${this.username}`)
          .then(() => {
            this.playgame = false;
            this.scorecard = false;
            this.init = true;
            this.gogogo = false;
            // socket.disconnect();
          })
      });

  },

  methods: {

    scoreCard: async function(){
      this.init = false;
      this.playgame = false;
      this.scorecard = true;
      axios.post("/setScoreCard")
        .then(console.log("good")).catch(console.log("error on axios call in scoreCard method"))
    }, 

    playGame: async function(){
      this.init = false;
      this.scorecard = false;
      this.playgame = true;
      
      axios.post("/setPlayGame")
        .then(console.log("good")).catch(console.log("error on axios call in playGame method"))
    },

    clearSession: function(){
      socket.emit('player-left', this.username);
    },

    entername: function(){
      axios.post('/api/online/login', {'name': this.username});
      this.gogogo = true;
      socket.emit('player-joined', this.username);
    }
  }

}
</script>


<style>
#button1 {
  display:inline-block;
  padding:0.35em 1.2em;
  border:0.1em solid #FFFFFF;
  margin:0 0.3em 0.3em 0;
  border-radius:0.12em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Roboto',sans-serif;
  font-weight:300;
  color:rgb(3, 3, 3);
  text-align:center;
  transition: all 0.2s;
}

#button1:hover{
  color:#000000;
  background-color:#FFFFFF;
}


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: hsl(263,45%,8%)
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
