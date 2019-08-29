<template>
    
    <div v-bind:class="{ trick: (trickDone) }">
      <button @click="toggleChat" class="chat-toggle" >Chat</button>
      <Chat class="chat" v-bind:all="all" v-bind:username="username" v-if="chat"/>
        <span id="logo">Round</span><br>
        <span style="margin:auto; width:2em; background:transparent; border:none; color:white; font-size:27px;text-align:center">{{round}}</span>
        <br>
        <br>

        <div v-if="turn">
          <div v-if="bet">
              <span style="font-size:20px; color:green;">Your Turn to Bet</span>
          </div>
              
          <div v-if="play">
              <span style="font-size:20px; color:green;"> Your Turn to Play a Card</span>
          </div>
        </div>

        <div v-else>
          <div v-if="bet">
              <span style="font-size:20px; color:red;">Waiting for {{allName}} to Bet</span>
          </div>
              
          <div v-if="play">
              <span style="font-size:20px; color:red;">Waiting for {{allName}} <span v-if="hand.length === cardsPerRound[round] && turnIndex > 0"> to Bet </span> <span v-else> to Play a Card </span> </span>
          </div>
        </div>

        <br>

        <span style="font-size:20px; color:white;">Number of tricks won: {{tricksWon}}</span>

        <br><br><br>

        <span style="font-size:14px; color:white">Opponents:</span>
        <div class="opponents">
          <div v-for="user in opponents" v-bind:key="user.name" style="border:1px solid darkgrey; padding:1%;">
            <span style="font-size:14px; color:white; margin-bottom:5px">{{user.name}}</span><br>
            <span v-bind:class="getClass(user)" style="color:white; font-size:10">{{opponentTricks[user.name]}} tricks won. {{tableData[round][user.name+"bet"]}} tricks needed.</span>
          </div>
        </div>
        
        <br><br>
        
        <div class="trump-container">
         <label class="card-no-hover"><span>Trump</span> <br>
         <!-- <div style="margin:auto; margin-top:10px; margin-right:5px; content-align:center" class="card-no-hover">  -->
          <img :src="getImg(trump)">
         <!-- </div> -->
         </label>
          
         
         <label class="card-no-hover"><span>Card Led:</span> 
         <!-- <div style="margin:auto; margin-top:10px; margin-left:5px; content-align:center;" class="card-no-hover"> -->
          <img style="border-radius:6%" :src="getImg(firstPlayedCard)">
         <!-- </div> -->
         </label>
        </div>

        <br><br>
        {{deck.cards.length}}
        <br>
        <!-- Hand: {{hand}} -->
        <br><br>

        <div style="margin:auto; content-align:center" class="winners" v-if="trickDone">
          {{trickWinner}} won this trick!
          <button @click="nextTrick()">Done</button>
        </div>
        
        <div v-else-if="roundDone">
          <div v-if="winners.length > 0" style="font-size:14px; color:white; margin-bottom:10px">
            <span v-for="(winner, i) in winners" v-bind:key="i"> {{winner}}, </span> won this round!
          </div>
          <div v-else style="font-size:10px; margin-bottom:10px; color:red">
            Nobody won the round... Losers.
          </div>
          <button @click="nextRound()">Deal Cards!</button>
        </div>

        <div v-else-if="waitingForDeal">
          <div v-if="winners.length > 0" style="font-size:14px; color:white; margin-bottom:10px">
            <span v-for="(winner, i) in winners" v-bind:key="i"> {{winner}}, </span> won this round!
          </div>
          <div v-else style="font-size:10px; margin-bottom:10px; color:red">
            Nobody won the round... Losers.
          </div>
          <span style="font-size:17px; color:white;">Waiting for {{allName}} to Deal the Cards</span>
        </div>

        <div v-else-if="!waitingForDeal">
          <!-- {{currentTrick}} -->
          <label><span>Current Trick:</span> <br> 
          <button v-for="(card, i) in currentTrick"  class="card-no-hover" v-bind:key="i"><img :src="getImg(card)"></button>
          </label>

          <br><br>

          <label style="display:flex; justify-content:center; align-content:center; flex-wrap:wrap"><span style="width:100%">Your Hand:</span><br>
            <div v-for="(card, i) in hand" v-bind:key="i" class="card">
              <button  @click="playCard(i)"  v-bind:id="i" name="cards" class="card-inner"><img :src="getImg(card)"></button>
            </div>
          </label>
        </div>

        <button @click="patpat">Pat Pat</button>

        <div style="color:red" v-if="wrongSuit">
          <br>
          Must play a card of the led suit if you have it!
        </div>

        <div style="color:red" v-if="waitturn">
          <br>
          It is not your turn to play a card.
        </div>

        <br><br>
        <!-- Round: {{round}} -->
        <br><br>

        <div v-if="turn && bet">
          <label style="margin-bottom:10px">{{username}}'s bet: 
          <input style="border-radius:7px; text-align:center" type="number" v-model="tableData[round][username+'bet']" v-bind:id="username+'betinput'" v-bind:placeholder="'bet for '+username">
          </label>
          <button v-on:click="submitBet()">Submit Bets</button>
        </div>
          
        <br><br>

        <Table v-bind:cardsPerRound="cardsPerRound" v-bind:tableData="tableData" v-bind:roundResults="roundResults" v-bind:headers="headers"/>

    </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import axios from "axios";
import {socket, eventBus} from "../main";
import { setTimeout } from 'timers';
import { copyFile } from 'fs';
import { async } from 'q';
import Table from './Table';
import Chat from './Chat';


export default {
  name: 'Game',
  components: {
    Table,
    Chat
  },
  
  data() {
    return{
        chat: false,
        trump: null,
        updatetablekey: 0, // this is an irrelavent data entry... dont worry about keeping state
        winners: [],
        wrongSuit: false,
        baseAll: [],
        trickWinner: "",
        firstPlayedCard: null,
        currentTrick: [],
        trickDone: false,
        roundDone: false,
        waitingForDeal: false,
        tricksWon: 0,
        turnIndex: 0,
        waitturn:false,
        bet: true,    // These two say whether betting is going on
        play: false,  // or playing
        hand: null,
        round: 0,
        cardsPerRound: [2,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10],
        deck: [],
        turn: false,
        headers:["Round"],
        tableData:[
          {'round': 0}, {'round': 1}, {'round': 2}, {'round': 3}, {'round': 4},
          {'round': 5}, {'round': 6}, {'round': 7}, {'round': 8},
          {'round': 9}, {'round': 10}, {'round': 11}, {'round': 12},
          {'round': 13}, {'round': 14}, {'round': 15}, {'round': 16},
          {'round': 17}, {'round': 18}, {'round': 19}
        ],
        roundResults:[
          {'round': 0}, {'round': 1}, {'round': 2},   {'round': 3}, {'round': 4},
          {'round': 5}, {'round': 6},   {'round': 7}, {'round': 8},
          {'round': 9}, {'round': 10},  {'round': 11}, {'round': 12},
          {'round': 13}, {'round': 14}, {'round': 15}, {'round': 16},
          {'round': 17}, {'round': 18}, {'round': 19}
        ],
        cardValueMapping: {'2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14},
        opponentTricks: {}
    }
  },

  props: {
      all: [],
      refresh: Boolean,
      username: String,
      initializer: Boolean,
    },

  computed: {
    allName: function() {
      if (this.all === undefined || this.all[this.turnIndex] === undefined){
        return "other player"
      }
      if ('name' in this.all[this.turnIndex]){
        return this.all[this.turnIndex]['name']
      } else {
        return "other player";
      }
    },

    opponents: function(){
      return this.all.filter(user => user.name !== this.username);
    }
  },


  created: async function(){

    eventBus.$emit('game-started');

    if (this.refresh){

      console.log("Refresh is TRUE");

      await axios.get('/api/online/betOrPlay')
        .then(res => {
          if (res.data === 'bet'){
            this.bet = true;
            this.play = false;
          } else if (res.data === 'play'){
            this.play = true;
            this.bet = false;
          }
        })

      await axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
        .catch(err => {console.log("problem getting deck")});

      await axios.get('/api/online/getall')
        .then(res => {this.all = res.data})
        .catch(err => {console.log("problem getting all")});

      await axios.get('/username')
        .then(res => {this.username = res.data});

      await axios.get('/api/online/turnIndex')
        .then(res => {
          this.turnIndex = res.data;
          if (this.all[this.turnIndex].name === this.username){
            this.turn = true;
          }
        })
        .catch(err => {console.log(err)});

      await axios.get('/api/online/getBaseAll')
        .then(res => {this.baseAll = res.data})
        .catch(err => {console.log("problem getting all")});

      await axios.get(`/api/online/getHand`)
        .then(res => {this.hand = res.data});

      await axios.get(`/api/online/getround`)
        .then(res => {this.round = parseInt(res.data, 10)})
        .catch(err => {console.log(err)});

      let sup = this;
      await axios.get('/api/score/getTable')
          .then(res => {
            console.log('++++++++++++', res.data);
            this.tableData = res.data;
            this.updatetablekey++;
            axios.get('/api/score/getRoundResults')
              .then(res2 => {
                sup.roundResults = res2.data;
          });
            // this.$forceUpdate();
          })
          .catch(err => console.log(err));

      await axios.get('/api/online/getTrick')
        .then(res => {
          this.currentTrick = res.data.cards;
          this.firstPlayedCard = res.data.lead;
          })
        .catch(err => {console.log(err)});



    } else {

        // for (let i = 0; i < this.all.length; i++){
        //   let n = this.all[i]['name'];
        //   this.tricksWon[n] = 0;
        // }

        await axios.post('/api/online/setBet')
          .catch(err => {console.log(err)});

        await axios.post(`/api/online/turnIndex/${this.turnIndex}`)
          .catch(err => {console.log(err)});

        await axios.post(`/api/online/setround/${this.round}`)
            .catch(err => {console.log(err)});

        console.log("Refresh is false");

        for (let i = 0; i < this.all.length; i++){
          this.baseAll.push(this.all[i]);
        }

        if (this.initializer){
          await axios.get('/api/online/setdeck')
            .then(res => {
              this.deck = res.data[0];
              this.trump = res.data[1];
              socket.emit('start-game', this.username);
              })
            .catch(err => {console.log("problem setting deck")});
        }
        console.log('before init trick');
        await axios.post('/api/online/initTrick');

        await axios.post('/api/online/setall', this.all)
          .catch(err => {console.log("problem setting all")});

        await axios.post('/api/online/setBaseAll', this.baseAll)
          .catch(err => {console.log(err)});

        await axios.get(`/api/online/dealHand/${this.cardsPerRound[this.round]}`)
          .then(res => {this.hand = res.data})

        await axios.get('/api/online/getdeck')
            .then(res => {
              this.deck = res.data[0];
              this.trump = res.data[1];
              this.sortCards(res.data[1]);
              })
          .catch(err => {console.log("problem getting deck")});

        if (this.all[this.turnIndex].name === this.username){
          this.turn = true;
        }

        for (let player of this.all){
          this.opponentTricks[player.name] = 0;
        }

        for (let row of this.tableData){
          for (let i=0; i < this.all.length; i++){
            // console.log(this.numberList)
            row[this.all[i]['name']+"score"] = 0;
            row[this.all[i]['name']+'bet'] = 0;
          }
        }
        axios.post("/api/score/saveTable", this.tableData)


        for (let row of this.roundResults){
          for (let i=0; i < this.all.length; i++){
            // console.log(this.numberList)
            row[this.all[i]['name']+"bet"] = 0;
            row['complete'] = false;
          }
        }
        axios.post("/api/score/saveRoundResults", this.roundResults)

    }

    for (let player of this.all){
      this.headers.push(player.name)
      this.headers.push(player.name + "'s " + "bet")
    }
    

  },


  mounted(){

// =======================================================

    eventBus.$on('next-turn', async data => {
        // console.log(this.username, data, this.all, this.currentTrick);
        if (!this.checkInAll(data[1])){
          return;
        }
        // console.log('made it past the check in');
        let sup = this;
        if (data[2]){
          this.firstPlayedCard = null;
        }
        if (this.currentTrick.length === this.all.length){
          // console.log("272 in socket..", this.all, this.turnIndex, this.trickWinner);
          let w = this.all.filter(p => p.name === this.trickWinner)[0];
          let index = this.all.indexOf(w);
          let newall = []
          for (let i = index; i < this.all.length; i++){
            newall.push(this.all[i]);
            // console.log(newall);
          }
          for (let i = 0; i < index; i++){
            newall.push(this.all[i]);
            // console.log(newall)
          }
          this.all = newall;
          await axios.post('/api/online/setall', this.all)
            .catch(err => {console.log("problem setting all", err)});
          // console.log("283 in socket..", this.all, this.turnIndex, data[0]);
          let crds = document.getElementsByName('cards');
          for (let i = 0; i< crds.length; i++){
            let butt = crds[i];
            butt.disabled = true;
          }
          setTimeout(function(){
            sup.trickDone = true
          }, 1000)
        }

        this.turnIndex = data[0];
        await axios.post(`/api/online/turnIndex/${this.turnIndex}`)
          .catch(err => {console.log(err)});
        if (this.all[this.turnIndex].name === this.username){
          this.turn = true;
          this.waitturn = false;
        } else {
          this.turn = false;
        }

        await axios.get('/api/score/getTable')
          .then(res => {
            // console.log(res);
            this.tableData = res.data;
          })
          .catch(err => console.log(err));
      });

// =======================================================

    eventBus.$on('card-played', data => {
      if (!this.checkInAll(data[2])){
        return;
      }
      this.currentTrick.push(data[0][0]);
      if (data[1]){
        this.firstPlayedCard = data[0][0];
        axios.post('/api/online/createTrick', this.firstPlayedCard)
          .catch(err => console.log("PROBLEM CREATING TRICK", err));
      } else {
        axios.post('/api/online/addToTrick', data[0][0])
      }
    });
// =======================================================

    eventBus.$on('we-got-a-winner', data => {
      if (!this.checkInAll(data)){
        return;
      }
      this.winners.push(data);

    });
// =======================================================

    eventBus.$on('next-round', user => {
      if (!this.checkInAll(user)){
        return;
      }
      // console.log('HERE', this.trickWinner);
      let sup = this;
      let crds = document.getElementsByName('cards');
      for (let i = 0; i< crds.length; i++){
        let butt = crds[i];
        butt.disabled = true;
      }
      this.firstPlayedCard = null;
      setTimeout(function(){
        sup.submitResults();
        sup.trickDone = true;

        sup.turnIndex = 0;
        axios.post(`/api/online/turnIndex/${sup.turnIndex}`)
        .catch(err => {console.log(err)});
        let firstshallbelast = sup.baseAll.splice(0,1);
        sup.baseAll.push(firstshallbelast[0]);
        let temp = [];
        for (let i = 0; i < sup.baseAll.length; i++){
          temp.push(sup.baseAll[i]);
        }
        sup.all = temp;

        axios.post('/api/online/setall', temp)
          .then(() => console.log(sup.all + ' is the new all'))
          .catch(err => {console.log('Error setting all 425.', err)});

        axios.post('/api/online/setBaseAll', sup.baseAll)
          .then(() => console.log("Base all set to ", sup.baseAll))
          .catch(err => {console.log("ERROR SETTING BASE ALL", err)});

        if (sup.all[sup.turnIndex].name === sup.username){
          sup.roundDone = true;
          sup.turn = true;
          sup.waitturn = false;
        } else {
          sup.waitingForDeal = true;
          sup.turn = false;
          sup.waitturn = false;
        }
        
      }, 1000)


      
    });
// =======================================================

    eventBus.$on('trick-done', async user => {
      if (!this.checkInAll(user)){
        return;
      }
      await axios.delete('/api/online/trick');
      this.trickDone = false;
      this.currentTrick = [];
    });
// =======================================================

    eventBus.$on('deck-updated', async user =>{
        console.log('**********************', this.username, this.all, user);
        if (!this.checkInAll(user)){
          console.log("USER NOT IN ALL!!!!!");
          return;
        }
        // console.log('MOTHER MOTHER AHHHHHHH');
        await axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
          .catch(err => {console.log("problem getting deck")});
    });
// =======================================================

    eventBus.$on('award-trick', data => {
      if (!this.checkInAll(data[0])){
        return;
      }
      if (data[1].username === this.username){
        this.tricksWon++
      }
      this.trickWinner = data[1].username;
      this.opponentTricks[this.trickWinner] = this.opponentTricks[this.trickWinner] + 1;
      
    });
// =======================================================

    eventBus.$on('round-done', async user => {
      if (!this.checkInAll(user)){
        return;
      }
      this.winners = [];
      console.log("Right before suspicios axios call");
      await axios.get('/api/score/getTable')
        .then(res => {
          console.log(res.data)
          this.tableData = res.data;
        }).catch(err => console.log(err));

        this.roundDone = false;
        this.waitingForDeal = false;
        this.tricksWon = 0;
        this.round++;
        this.bet = true;
        this.play = false;
        for (let player of this.all){
          this.opponentTricks[player.name] = 0;
        }
        axios.post('/api/online/setBet')
          .catch(err => {console.log(err)});

        await axios.get('/api/score/getRoundResults')
          .then(res => {
            this.roundResults = res.data;
            this.updateTable()
          });
        // console.log("400 right before dealing hand", this.deck, this.hand);
        await this.dealHand()

        await axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
          .catch(err => {console.log("problem getting deck")});

        await axios.post(`/api/online/setround/${this.round}`)
          .catch(err => {console.log(err)});

        await this.sortCards(this.trump);

    });
// =======================================================

    eventBus.$on('pat-pat', user => {
      if (!this.checkInAll(user)){
        return;
      }
      if (this.turn){
        alert("Pat Pat Mothafucka");
      }
    })

// =======================================================

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

      getClass: function(user){
        return {
          'won': this.opponentTricks[user.name] == this.tableData[this.round][user.name+'bet'],
          'lost': this.opponentTricks[user.name] > this.tableData[this.round][user.name+'bet']
        }
      },

// =======================================================

    nextRound: function(){

        socket.emit('round-done', this.username)
        
    },

// =======================================================

    newDeck: function(){
        axios.get('/api/online/setdeck')
            .then(res => {
                this.deck = res.data[0];
                this.trump = res.data[1];
              })
            .catch(err => {console.log(err)});
    },

// =======================================================

    dealHand: function(){
        axios.get(`/api/online/dealHand/${this.cardsPerRound[this.round]}`)
            .then(res => {
              this.hand = res.data;
              // console.log("Right after the hand was dealt", this.hand);
              socket.emit('deck-updated', this.username);
              })
    },

// =======================================================

    playCard: async function(i){
      this.wrongSuit = false;
      if (this.turn && !(this.bet)){
        console.log("Good Turn... ", i, this.hand, this.all, this.username);
        this.waitturn = false;
        if (this.turnIndex > 0){
          let potentialCard = this.hand[i];
          if (potentialCard.suit !== this.firstPlayedCard.suit){
            let samesuit = this.hand.filter(c => c.suit === this.firstPlayedCard.suit);
            if (samesuit.length >= 1){
              this.wrongSuit = true;
              return;
            }
          }
        }
        let firstCardBoolean = false;
        let card = this.hand.splice(i, 1);
        card[0]['username'] = this.username;
        this.turn = false;
        axios.put('/api/online/updatehand', this.hand).catch(err => console.log(err));
        if (this.turnIndex === 0){
          this.firstPlayedCard = card[0];
          firstCardBoolean = true
        }
        
        this.turnIndex++;
        axios.post(`/api/online/turnIndex/${this.turnIndex}`)
        .catch(err => {console.log(err)});

        let trick = [];
        for (let i=0; i< this.currentTrick.length; i++){
          trick.push(this.currentTrick[i]);
        }

        await socket.emit('card-played', [card, firstCardBoolean, this.username]);
        console.log("504 in card played", this.turnIndex, this.all);
        let trickDoneBoolean = false;
        if (this.turnIndex === this.all.length){
          trickDoneBoolean = true;
          await this.awardTrick(trick, card[0]);
          this.turnIndex = 0;
          axios.post(`/api/online/turnIndex/${this.turnIndex}`)
            .catch(err => {console.log(err)});
          if (this.hand.length === 0){
            await this.newDeck();
            socket.emit('next-round', this.username);
          } else{
            // console.log("Prior to socket", this.all, this.turnIndex, this.username);
            socket.emit('next-turn', [this.turnIndex, this.username, trickDoneBoolean]);
          }
        } else {socket.emit('next-turn', [this.turnIndex, this.username, trickDoneBoolean]);}
        
      } else {
        console.log("SETTING WAITTURN TO TRUE... ", i, this.hand, this.all, this.username);
        this.waitturn = true;
      }
    },

// =======================================================

    awardTrick: function(trick, newcard){
      let trumpSuit = this.trump['suit'];
      let ledSuit = this.firstPlayedCard['suit'];
      trick.push(newcard);
      let trumpsPlayed = [];
      let ledPlayed = [];

      for (let i=0; i < trick.length; i++){
        let card = trick[i];
        if (card['suit'] === trumpSuit){
          trumpsPlayed.push(card);
        }
        if (card['suit'] === ledSuit){
          ledPlayed.push(card);
        }
      }

      let winningCard = null;
      let currentBestRank = 0;
      if (trumpsPlayed.length > 0){
        for (let i = 0; i < trumpsPlayed.length; i++){
          let possibleWinner = trumpsPlayed[i];
          if (this.cardValueMapping[possibleWinner['rank']] > currentBestRank){
            currentBestRank = this.cardValueMapping[possibleWinner['rank']];
            winningCard = possibleWinner;
          }
        }
      } else if (ledPlayed.length > 0){
        for (let i = 0; i < ledPlayed.length; i++){
          let possibleWinner = ledPlayed[i];
          if (this.cardValueMapping[possibleWinner['rank']] > currentBestRank){
            currentBestRank = this.cardValueMapping[possibleWinner['rank']];
            winningCard = possibleWinner;
          }
        }
      }
      // console.log("WINNING CARD -- ", winningCard)
      socket.emit('award-trick', [this.username, winningCard]);
    },

// =======================================================

    submitBet: async function(){
      this.waitturn = false;
      this.turn = false;
      this.turnIndex ++;
      if (this.turnIndex === this.all.length){
        this.turnIndex = 0;
      }
      await axios.post(`/api/online/turnIndex/${this.turnIndex}`)
        .catch(err => {console.log(err)});
      await axios.post("/api/score/saveTable", this.tableData)
        .then(res => {
          this.bet = false;
          this.play = true;
          axios.post('/api/online/setPlay')
          .catch(err => {console.log(err)});
          socket.emit('next-turn', [this.turnIndex, this.username, false]);
        });


    },

// =======================================================

    toggleChat: function(){
      this.chat = !this.chat;
    },

// =======================================================

    submitResults: function(){
      // Here items is the list of winners

      let wager = this.tableData[this.round][this.username+"bet"];

      axios.post('/api/score/addRoundResults', [this.round, this.username, this.tricksWon, wager])
        .then(res => {
          if (res.data){
            socket.emit('we-got-a-winner', this.username);
          }
        });
    },

// =======================================================

    // this.tableData = [{ "round": 1, "p0score": 0, "player0bet": 0, "p1score": 0, "player1bet": 0, "p2score": 0, "player2bet": 0, "p3score": 0, "player3bet": 0, "p4score": 0, "player4bet": 0 }
    // this.roundResults = [{'round': 1, 'player0bet': 1 or -1 or 0...}]
    updateTable: function(){

      for (let i = 0; i < this.tableData.length; i++ ){
        let sup = this;
        let round = this.tableData[i];
        let prevscore = 0
        if (i > 0){prevscore = this.tableData[i-1]}
        let roundWinners = this.roundResults[i]

        this.all.forEach(function(player){
          let name = player['name'];
          let bet = parseInt(round[name+'bet'], 10);
          if (roundWinners[name+'bet'] === 1){
            // console.log(prevscore)
            if (i === 0){round[name+'score'] = bet + 10}
            else if (i > 0){round[name+'score'] = prevscore[name+'score'] + bet + 10}
          } else if (roundWinners[name+'bet'] === -1){
            if (i > 0){round[name+'score'] = prevscore[name+'score']}
          }
        });
      }
      axios.post("/api/score/saveTable", this.tableData)
        .then(console.log("good")).catch(err => console.log(err))
    },

// =======================================================

    nextTrick: function(){
      socket.emit('trick-done', this.username)
    },

// =======================================================

    getImg: function(card){
      if (!card){
        return require('../assets/cards/empty.jpg');
      }
      if (card['rank'] === 'A' && card['suit'] === 'D'){
        return require('../assets/cards/acediamonds.png')
      }
      return require('../assets/cards/'+card['rank']+card['suit']+'.png');
    },

    sortCards: function(trump){
            let temp = [];
            let suits;
            switch (trump.suit){
              case "D":
                suits = ["C", "H", "S", "D"];
                for (let suit of suits){
                  for (let card of this.hand){
                    if (card.suit === suit) {
                      temp.push(card);
                    }
                  }
                }
                break;
              case "H":
                suits = ["C", "D", "S", "H"];
                for (let suit of suits){
                  for (let card of this.hand){
                    if (card.suit === suit) {
                      temp.push(card);
                    }
                  }
                }
                break;
              case "C":
                suits = ["H", "S", "D", "C"];
                for (let suit of suits){
                  for (let card of this.hand){
                    if (card.suit === suit) {
                      temp.push(card);
                    }
                  }
                }
                break;
              case "S":
                suits = ["D", "C", "H", "S"];
                for (let suit of suits){
                  for (let card of this.hand){
                    if (card.suit === suit) {
                      temp.push(card);
                    }
                  }
                }
                break;
            }
            this.hand = temp;
    },

    patpat: function(){
      socket.emit('pat-pat', this.username);
    }

  },

  beforeDestroy(){

    eventBus.$off('next-turn');

    eventBus.$off('card-played');

    eventBus.$off('next-round');

    eventBus.$off('trick-done');

    eventBus.$off('deck-updated');

    eventBus.$off('award-trick');

    eventBus.$off('round-done');

    eventBus.$off('we-got-a-winner');

    eventBus.$off('pat-pat')

  },

  destroyed(){

    eventBus.$emit('game-ended');

  }

}
</script>


<style scoped>

.hand-elements{
  
}

.card{
  -webkit-appearance: none;
  width: 5%;
  padding: 0%;
  border: 0%;
  margin: 1%;
  border-radius: 6%;
  min-width: 50px;
}

.card-inner{
  -webkit-appearance: none;
  width: 100%;
  padding: 0%;
  border: 0%;
  margin: 1%;
  border-radius: 6%;
  min-width: 50px;
}

.card-no-hover{
  -webkit-appearance: none;
  width: 5%;
  padding: 0%;
  border: 0%;
  margin: 1%;
  border-radius: 6%;
  min-width: 50px;
}


#logo {
  font-family: 'Open Sans', sans-serif;
  color: #555;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 33px;
  font-weight: 800;
  letter-spacing: -3px;
  line-height: 1;
  text-shadow: #EDEDED 2px 1px 0;
  position: relative;
}

table{
  border-collapse: collapse
}

col:first-child {background: #FF0}
col:nth-child(2n+3) {background: #CCC}

table tr:nth-of-type(n) {
    border-bottom: 2px solid;
}

table tr:last-child{
  border-bottom: none !important
}

table td:nth-of-type(2n) { border-left:2px solid; }

td input{
  text-align: center;
  width:100% !important
}

.won{
  color:green !important
}

.lost{
  color:red !important
}

.trick > *{
  opacity: 0.2;
}

.trick > .winners {
  opacity: 1;
  width: 50%;
  height: 30%;
}

img {
    width:100%;
    height:auto;
}

.card:hover{
  opacity: 0.5;
}

.trump-container{
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
}

.opponents{
  margin-top: 10px;
  display: flex;
  align-content: center;
  justify-content: center;
  
}

.chat{
  position: fixed;
  height: 100vh;
  width: 30%;
  right:0px;
  top: 0px;

  z-index: 1;
  overflow-y: scroll;
}

.chat-toggle{
  -webkit-appearance: none;
  width: 6%;
  min-width: 60px;
  height: 5%;
  min-height: 30px;
  padding: 5px;
  position:fixed; 
  top:0px; 
  right:0px; 
  z-index:2;
  background-color: #8e98a5;
  border-radius: 5px
}

</style>
