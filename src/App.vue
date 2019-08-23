<template>
  <div id="app">
    {{gameOpen}}
      <button id="button1" style="margin:10px; margin-bottom:10%" @click="clearSession">Start Over</button>
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
          <input  id="button2" type="button" @click="entername" v-bind:value="username">
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
      gameOpen: false,
      scorecard: false,
      playgame: false,
      gogogo: false,
      lobbyOpen: false,
      username: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 5)
    }
  },


  created: async function(){


    eventBus.$on('game-started', () => {
      this.gameOpen = true;
    });

    eventBus.$on('game-ended', () => {
      this.gameOpen = false;
    });

    eventBus.$on('lobby-started', () => {
      this.lobbyOpen = true;
    });

    eventBus.$on('loby-ended', () => {
      this.lobbyOpen = false;
    });

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

  mounted(){

// =======================================================

    socket.on('player-joined', user => {
      if (this.lobbyOpen){
        eventBus.$emit('player-joined', user);
      }

    });

// =======================================================

    socket.on('player-left', user => {
      if (this.lobbyOpen){
        eventBus.$emit('player-left', user);
      }

    });

// =======================================================

    socket.on('start-game', d => {
      if (this.lobbyOpen){
        eventBus.$emit('start-game', d);
      }

    });

// =======================================================

    socket.on('next-turn', data => {
      if (this.gameOpen){
        eventBus.$emit('next-turn', data);

      }

    });

// =======================================================

    socket.on('card-played', data => {
      if (this.gameOpen){
        eventBus.$emit('card-played', data);

      }

    });
// =======================================================

    socket.on('next-round', user => {
      if (this.gameOpen){
        eventBus.$emit('next-round', user);

      }

    });
// =======================================================

    socket.on('trick-done', user => {
      if (this.gameOpen){
        eventBus.$emit('trick-done', user);

      }

    });
// =======================================================

    socket.on('deck-updated', user =>{
      if (this.gameOpen){
        eventBus.$emit('deck-updated', user);

      }

    });
// =======================================================

    socket.on('award-trick', data => {
      if (this.gameOpen){
        eventBus.$emit('award-trick', data);

      }

    });
// =======================================================

    socket.on('round-done', user => {
      if (this.gameOpen){
        eventBus.$emit('round-done', user);
      }
        

    });
// =======================================================

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
  -webkit-appearance: none;
  margin-left: 2.5%;
  margin-right:2.5%;
	background-color:#8e98a5;
	font-family: 'Open Sans', sans-serif;
	font-size:18px;
	text-decoration:none;
	color:#fff;
	position:relative;
	padding:10px 20px;
	padding-right:50px;
	background-image: linear-gradient(bottom, rgb(161, 158, 156) 0%, rgb(101,86,78) 100%);
	border-radius: 5px;
	box-shadow: inset 0px 1px 0px #9e8d84, 0px 5px 0px 0px #322620, 0px 8px 5px rgb(83, 83, 83);
}

#button1:active {
	top:3px;
	background-image: linear-gradient(bottom, rgb(62,51,46) 100%, rgb(101,86,78) 0%);
	box-shadow: inset 0px 1px 0px #9e8d84, 0px 2px 0px 0px #322620, 0px 5px 3px #999;
}

#button1::before {
	background-color:#8e98a5;;
	background-image:url(./assets/x.png);
	background-repeat:no-repeat;
	background-position:center center;
	content:"";
	width:20px;
	height:20px;
	position:absolute;
	right:15px;
	top:50%;
	margin-top:-9px;
	border-radius: 50%;
	box-shadow: inset 0px 1px 0px #19120f, 0px 1px 0px #827066;
}

#button1:active::before {
	top:50%;
	margin-top:-12px;
	box-shadow: inset 0px 1px 0px #827066, 0px 3px 0px #19120f, 0px 6px 3px #382e29;
}

#button2 {
  -webkit-appearance: none;
  margin-left: 2.5%;
  margin-right:2.5%;
	background-color:#8e98a5;
	font-family: 'Open Sans', sans-serif;
	font-size:18px;
	text-decoration:none;
	color:#fff;
	position:relative;
	padding:10px 20px;
	padding-right:20px;
	background-image: linear-gradient(bottom, rgb(161, 158, 156) 0%, rgb(101,86,78) 100%);
	border-radius: 5px;
	box-shadow: inset 0px 1px 0px #9e8d84, 0px 5px 0px 0px #322620, 0px 8px 5px rgb(83, 83, 83);
}

#button2:active {
	top:3px;
	background-image: linear-gradient(bottom, rgb(62,51,46) 100%, rgb(101,86,78) 0%);
	box-shadow: inset 0px 1px 0px #9e8d84, 0px 2px 0px 0px #322620, 0px 5px 3px #999;
}

#button2::before {
	background-color:#8e98a5;;
	background-repeat:no-repeat;
	background-position:center center;
	content:"";
	width:20px;
	height:20px;
	position:absolute;
	right:15px;
	top:50%;
	margin-top:-9px;
	border-radius: 50%;
	box-shadow: inset 0px 1px 0px #19120f, 0px 1px 0px #827066;
}

#button2:active::before {
	top:50%;
	margin-top:-12px;
	box-shadow: inset 0px 1px 0px #827066, 0px 3px 0px #19120f, 0px 6px 3px #382e29;
}

/* #button1 {
  -webkit-appearance: none;
  display:inline-block;
  padding:0.35em 1.2em;
  border:0.1em solid;
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
} */


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
