<template>
    
    <div v-bind:class="{ trick: (trickDone) }">

        <span id="logo">Round</span><br>
        <span style="margin:auto; width:2em; background:transparent; border:none; color:white; font-size:40px;text-align:center">{{round}}</span>
        <br>
        <br>

        <div v-if="turn">
          <div v-if="bet">
              <span style="font-size:30px; color:green;">Your Turn to Bet</span>
          </div>
              
          <div v-if="play">
              <span style="font-size:30px; color:green;"> Your Turn to Play a Card</span>
          </div>
        </div>

        <div v-else>
          <div v-if="bet">
              <span style="font-size:30px; color:red;">Waiting for {{all[turnIndex]['name']}} to Bet</span>
          </div>
              
          <div v-if="play">
              <span style="font-size:30px; color:red;">Waiting for {{all[turnIndex]['name']}} <span v-if="hand.length === cardsPerRound[round] && turnIndex > 0"> to Bet </span> <span v-else> to Play a Card </span> </span>
          </div>
        </div>

        <br>

        <span style="font-size:30px; color:white;">Number of tricks won: {{tricksWon}}</span>

        <br><br>

        {{all}}
        {{username}}
        <br><br>
        Deck: {{deck}} <br><br> Trump: {{trump}} <br><br> Card Led: {{firstPlayedCard}}
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
          {{trickWinner}} won this round!
          <button @click="nextRound()">Done</button>
        </div>

        <div v-else>
          {{currentTrick}}
          <button v-for="(card, i) in currentTrick"  v-bind:key="i">Suit: {{card.suit}} <br> <br> Rank: {{card.rank}}</button>
          <br><br>
          <button v-for="(card, i) in hand" @click="playCard(i)" v-bind:key="i" v-bind:id="i" name="cards">Suit: {{card.suit}} <br> <br> Rank: {{card.rank}}</button>
        </div>

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
          <button v-on:click="submitBet()">Submit Bets</button>
        </div>
          
        <br><br>

        <table style="width:100%">

          <thead>
            <col style="width:auto; height:100%" v-for="(_, i) in this.headers" v-bind:key="i">
            <tr>
              <th v-for="(h, index) in this.headers" v-bind:key="index">{{h}}</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(d, ind) of this.tableData" v-bind:key="ind">
              <td>
                <div style="margin:auto; width:2em; background:transparent; border:none; color:white">{{cardsPerRound[d['round']]}}</div>
              </td>

              <td v-for="(key, index) of Object.keys(d).slice(1)" v-bind:key="index">
                <span v-bind:class="{ won: (roundResults[ind][key]===1) , lost: (roundResults[ind][key]===-1) }" style="width:2em; background:transparent; border:none; color:white" type="number" maxlength="3">{{d[key]}}</span>
              </td>

            </tr>

          </tbody>
          
        </table>
    </div>
</template>

<script>

// import { eventBus } from "./main";
// import { async } from 'q';
import axios from "axios";
import {socket, eventBus} from "../main";
import { setTimeout } from 'timers';
import { copyFile } from 'fs';


export default {
  name: 'Game',
  components: {

  },
  
  data() {
    return{
        trump: null,
        wrongSuit: false,
        baseAll: [],
        trickWinner: "",
        firstPlayedCard: null,
        currentTrick: [],
        trickDone: false,
        roundDone: false,
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
    }
  },

  props: {
      all: [],
      refresh: Boolean,
      username: String,
      initializer: Boolean,
    },


  created: async function(){

    eventBus.$emit('game-started');

    if (this.refresh){

      console.log("Refresh is TRUE");

      await axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
        .catch(err => {console.log("problem getting deck")});

      await axios.get('/api/online/getall')
        .then(res => {this.all = res.data})
        .catch(err => {console.log("problem getting all")});

      await axios.get(`/api/online/getHand`)
        .then(res => {this.hand = res.data});

      await axios.get(`/api/online/getround`)
        .then(res => {this.round = parseInt(res.data, 10)})
        .catch(err => {console.log(err)});

      await axios.get('/username')
        .then(res => {this.username = res.data});

    } else {

      // for (let i = 0; i < this.all.length; i++){
      //   let n = this.all[i]['name'];
      //   this.tricksWon[n] = 0;
      // }

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


      await axios.post('/api/online/setall', this.all)
        .catch(err => {console.log("problem setting all")});

      await axios.get(`/api/online/dealHand/${this.cardsPerRound[this.round]}`)
        .then(res => {this.hand = res.data})

      await axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
        .catch(err => {console.log("problem getting deck")});

      if (this.all[this.turnIndex].name === this.username){
        this.turn = true;
      }
    }

    for (let player of this.all){
      this.headers.push(player.name)
      this.headers.push(player.name + "'s " + "bet")
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


  },

  mounted(){

// =======================================================

    eventBus.$on('next-turn', data => {
        console.log(this.username, data, this.all);
        if (!this.checkInAll(data[1])){
          return;
        }

        let sup = this;
        if (this.currentTrick.length === this.all.length){
          console.log("272 in socket..", this.all, this.turnIndex, this.trickWinner);
          let w = this.all.filter(p => p.name === this.trickWinner)[0];
          let index = this.all.indexOf(w);
          let newall = []
          for (let i = index; i < this.all.length; i++){
            newall.push(this.all[i]);
            console.log(newall);
          }
          for (let i = 0; i < index; i++){
            newall.push(this.all[i]);
            console.log(newall)
          }
          this.all = newall;
          console.log("283 in socket..", this.all, this.turnIndex, data[0]);
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
        if (this.all[this.turnIndex].name === this.username){
          this.turn = true;
          this.waitturn = false;
        } else {
          this.turn = false;
        }

        axios.get('/api/score/getTable')
          .then(res => {
            console.log(res);
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
      }
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
      setTimeout(function(){
        sup.submitResults();
        sup.trickDone = true;
        sup.roundDone = true;
        sup.turnIndex = 0;
        let firstshallbelast = sup.baseAll.splice(0,1);
        sup.baseAll.push(firstshallbelast[0]);
        let temp = [];
        for (let i = 0; i < sup.baseAll.length; i++){
          temp.push(sup.baseAll[i]);
        }
        sup.all = temp;
        if (sup.all[sup.turnIndex].name === sup.username){
          sup.turn = true;
          sup.waitturn = false;
        } else {
          sup.turn = false;
        }
        
      }, 1000)


      
    });
// =======================================================

    eventBus.$on('trick-done', user => {
      if (!this.checkInAll(user)){
        return;
      }
      this.trickDone = false;
      this.currentTrick = [];
    });
// =======================================================

    eventBus.$on('deck-updated', user =>{
        console.log('**********************', this.username, this.all, user);
        if (!this.checkInAll(user)){
          console.log("USER NOT IN ALL!!!!!");
          return;
        }
        // console.log('MOTHER MOTHER AHHHHHHH');
        axios.get('/api/online/getdeck')
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
      
    });
// =======================================================

    eventBus.$on('round-done', user => {
      if (!this.checkInAll(user)){
        return;
      }
      console.log("Right before suspicios axios call");
      axios.get('/api/score/getTable')
        .then(res => {
          console.log(res.data)
          this.tableData = res.data;
        }).catch(err => console.log(err));

        this.roundDone = false;
        this.tricksWon = 0;
        this.round++;
        this.bet = true;
        this.play = false;

        axios.get('/api/score/getRoundResults')
          .then(res => {
            this.roundResults = res.data;
            this.updateTable()
          })
        // console.log("400 right before dealing hand", this.deck, this.hand);
        this.dealHand();

        axios.get('/api/online/getdeck')
          .then(res => {
            this.deck = res.data[0];
            this.trump = res.data[1];
            })
          .catch(err => {console.log("problem getting deck")});

        axios.post(`/api/online/setround/${this.round}`)
          .catch(err => {console.log(err)});
    });
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

// =======================================================

    nextRound: function(){
        // this.roundDone = false;
        // this.tricksWon = 0;
        // this.round++;
        // this.bet = true;
        // this.play = false;

        // axios.get('/api/score/getRoundResults')
        //   .then(res => {
        //     this.roundResults = res.data;
        //     this.updateTable()
        //   })
        // // this.updateTable()

        // this.dealHand();

        // axios.get('/api/online/getdeck')
        //   .then(res => {
        //     this.deck = res.data[0];
        //     this.trump = res.data[1];
        //     })
        //   .catch(err => {console.log("problem getting deck")});

        // axios.post(`/api/online/setround/${this.round}`)
        //   .catch(err => {console.log(err)});

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
        this.waitturn = false;
        this.turnIndex++;

        let trick = [];
        for (let i=0; i< this.currentTrick.length; i++){
          trick.push(this.currentTrick[i]);
        }

        await socket.emit('card-played', [card, firstCardBoolean, this.username]);
        console.log("504 in card played", this.turnIndex, this.all)
        if (this.turnIndex === this.all.length){
          await this.awardTrick(trick, card[0]);
          this.turnIndex = 0;
          if (this.hand.length === 0){
            await this.newDeck();
            socket.emit('next-round', this.username);
          } else{
            // console.log("Prior to socket", this.all, this.turnIndex, this.username);
            socket.emit('next-turn', [this.turnIndex, this.username]);
          }
        } else {socket.emit('next-turn', [this.turnIndex, this.username]);}
        
      } else {
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

    submitBet: function(){
      this.waitturn = false;
      this.turn = false;
      this.turnIndex ++;
      if (this.turnIndex === this.all.length){
        this.turnIndex = 0;
      }
      axios.post("/api/score/saveTable", this.tableData)
        .then(res => {
          this.bet = false;
          this.play = true;
          socket.emit('next-turn', [this.turnIndex, this.username]);
        });


    },

// =======================================================

    getWinners: function(){

    },

// =======================================================

    submitResults: function(){
      // Here items is the list of winners

      let wager = this.tableData[this.round][this.username+"bet"];

      axios.post('/api/score/addRoundResults', [this.round, this.username, this.tricksWon, wager]);
    },

// =======================================================

    // this.tableData = [{ "round": 1, "p0score": 0, "player0bet": 0, "p1score": 0, "player1bet": 0, "p2score": 0, "player2bet": 0, "p3score": 0, "player3bet": 0, "p4score": 0, "player4bet": 0 }
    // this.roundResults = [{'round': 1, 'player0bet': 1 or -1 or 0...}]
    updateTable: function(){

      for (let i = 0; i < this.tableData.length; i++ ){
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
      this.trickDone = false;
      this.currentTrick = [];
      socket.emit('trick-done', this.username)
    }

// =======================================================

  },

  beforeDestroy(){

    eventBus.$off('next-turn');

    eventBus.$off('card-played');

    eventBus.$off('next-round');

    eventBus.$off('trick-done');

    eventBus.$off('deck-updated');

    eventBus.$off('award-trick');

    eventBus.$off('round-done');

  },

  destroyed(){

    eventBus.$emit('game-ended');

  }

}
</script>


<style>

#logo {
  font-family: 'Open Sans', sans-serif;
  color: #555;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 50px;
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

</style>
