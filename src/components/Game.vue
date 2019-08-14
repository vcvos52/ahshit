<template>
    <div>
        Deck: {{deck}}
        <br>
        Hand: {{hand}}
        <br>
        Round: {{round}}
        <br><br>
        <button @click="nextRound()">Next Round</button>
    </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import axios from "axios";
import {socket} from "../main";


export default {
  name: 'Game',
  components: {

  },
  
  data() {
    return{
        hand: null,
        round: 0,
        cardsPerRound: [10,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10],
        deck: []
    }
  },

  props: {
      all: []
    },


  created: async function(){

    await axios.get('/api/online/setdeck')
    .then(res => {this.deck = res.data})
    .catch(err => {console.log("problem setting deck")});

    await axios.get(`/api/online/getHand/${this.cardsPerRound[this.round]}`)
    .then(res => {this.hand = res.data})


  },

  mounted(){


  },

  methods: {

    nextRound: function(){
        console.log('nextRound')
        this.round++;
        this.newDeck();
        this.dealHand();
    },

    newDeck: function(){
        axios.get('/api/online/newdeck')
            .then(res => {this.deck = res.data})
            .catch(err => {console.log(err)});
    },

    dealHand: function(){
        axios.get(`/api/online/getHand/${this.cardsPerRound[this.round]}`)
            .then(res => {this.hand = res.data})
    }

  }

}
</script>


<style>

</style>
