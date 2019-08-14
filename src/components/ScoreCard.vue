<template>
    <div>
        <div style="width:75%; margin:auto; margin-top:100px" v-if="presentForm===false && askNamesBool===false">
            <span style="color: white; margin-right: 20px">How many players? </span>
            <input type="number" v-model="players" name="ps">
            <button @click="askNames">Start Game!</button>
            <span style="color:red; margin-left:20px" v-if="players > 5 || players < 2">Pick a number between 2 and 5!</span>
        </div>

        <div style="width:75%; margin:auto; margin-top:100px" v-if="presentForm===false && askNamesBool===true">
            <span style="color: white; margin-right: 20px">What are the players names?</span>
            <div v-for="elem in numberList" v-bind:key="elem.key">
              <input type="text" v-model="elem.name" placeholder="enter name">
            </div>
            <button v-on:click="createForm">Start Game!</button>
        </div>

        <div style="margin:auto; width:75%; margin-top:100px" v-if="presentForm===true">

          <span id="logo">Round</span><br>

          <button style="font-size:35px; background-color:rgb(130, 130, 130); border:0px; border-radius:7px; width:1em" @click="decrement()">-</button>
          <input type="number" v-model="select_round" style="margin:auto; width:2em; background:transparent; border:none; color:white; font-size:40px;text-align:center" min="0" max="20">
          <button style="font-size:35px; background-color:rgb(130, 130, 130); border:0px; border-radius:7px; width:1em" @click="increment()">+</button>
            
            <table style="width:100%">

              <thead>
                <col style="width:auto; height:100%" v-for="(_, i) in this.headers" v-bind:key="i">
                <tr>
                  <th v-for="(h, index) in this.headers" v-bind:key="index">{{h}}</th>
                </tr>
              </thead>

              <tbody>

                <tr v-for="(d, ind) of this.tableData" v-bind:key="ind">
                  <input type="radio" name="selectRound" v-model="select_round" v-bind:value="d['round']" v-bind:id="d['round']"/>
                  <td @click="p(d['round'])">
                    <div style="margin:auto; width:2em; background:transparent; border:none; color:white">{{cardCount[d['round']-1]}}</div>
                  </td>

                  <td v-for="(key, index) of Object.keys(d).slice(1)" v-bind:key="index">
                    <input v-bind:class="{ won: (roundResults[ind][key]===1) , lost: (roundResults[ind][key]===-1) }" style="width:2em; background:transparent; border:none; color:white" type="number" maxlength="3" v-model="d[key]">
                  </td>

                </tr>

              </tbody>
              
            </table>

            <div style="margin-top:80px; margin-bottom:30px; font-size:1.3em">
              <span >Round {{select_round}}: </span><br><br>
              <label> Players' Bet: 
              <input style="margin-right:10px" type="radio" name="user" v-model="userInput" v-bind:value="`bet`"/>
              </label>
              <label> Input Winners
              <input type="radio" name="user" v-model="userInput" v-bind:value="`winners`"/>
              </label>
            </div>

            <div v-if="userInput==='bet'">
              <div style="margin-bottom:10px; margin-top:10px" v-for="elem in numberList" v-bind:key="elem.key">
                <label style="margin-bottom:10px">{{elem.name}}'s bet: 
                <input style="border-radius:7px; text-align:center" type="number" v-model="tableData[select_round-1][elem.name+'bet']" v-bind:id="elem.name+'betinput'" v-bind:placeholder="'bet for '+elem.name">
                </label>
                <!-- v-on:input="editTableData(select_round-1, elem.name)" -->
              </div>
              <button v-on:click="submitBets()">Submit Bets</button>
            </div>

            <div v-if="userInput==='winners'">
              Who won? <br>
              <div v-for="elem in numberList" v-bind:key="elem.key">
                <label>{{elem.name}}   
                <input name="rr" type="checkbox" v-bind:value="elem.name"/>
                </label>
              </div>
              <button v-on:click="submitResults()">Submit Round</button>           
            </div>
            
        </div>
        <!-- {{numberList}} -->
    </div>
</template>

<script>

// import { eventBus } from "./main";
import axios from "axios";

export default {
  name: 'app',  
  data() {
    return{
      userInput: 'bet',
      bet: 0,
      players: 5,
      select_round:1,
      presentForm: false,
      askNamesBool: false,
      numberList: [],
      playerNames:[],
      headers:['', "Round"],
      tableData:[
        {'round': 1},
        {'round': 2},
        {'round': 3},
        {'round': 4},
        {'round': 5},
        {'round': 6},
        {'round': 7},
        {'round': 8},
        {'round': 9},
        {'round': 10},
        {'round': 11},
        {'round': 12},
        {'round': 13},
        {'round': 14},
        {'round': 15},
        {'round': 16},
        {'round': 17},
        {'round': 18},
        {'round': 19},
        {'round': 20},
      ],
      roundResults:[
        {'round': 1},
        {'round': 2},
        {'round': 3},
        {'round': 4},
        {'round': 5},
        {'round': 6},
        {'round': 7},
        {'round': 8},
        {'round': 9},
        {'round': 10},
        {'round': 11},
        {'round': 12},
        {'round': 13},
        {'round': 14},
        {'round': 15},
        {'round': 16},
        {'round': 17},
        {'round': 18},
        {'round': 19},
        {'round': 20},
      ],
    cardCount: [10,9,8,7,6,5,4,3,2,1,1,2,3,4,5,6,7,8,9,10]
    }
  },

  created: function(){

    axios.get('/api/score/status')
      .then(res => {
        if (res.data[0] === 'askNames'){
          this.presentForm = false;
          this.askNamesBool = true;
          this.numberList = res.data[1];
        } else if (res.data[0] === 'presentForm'){
          this.askNamesBool = false;
          this.presentForm = true;
          this.numberList = res.data[1];
          this.tableData = res.data[2]
          this.roundResults = res.data[3]
          this.generateTableHead();
        }
      })
      .catch(() => {
        this.presentForm = false;
        this.askNamesBool = false;
      });

  },

  methods: {
    createForm: function(){
      if (this.players < 6 && this.players > 1){

        axios.put('/api/score/setForm', this.numberList)
        .catch(err => {console.log(err)});

        this.presentForm = true;
        this.askNamesBool = false;
        this.generateTableHead();
        this.fillTableData();
        this.fillRoundResultData();
      }
    },

    p: function(n){
      var ele = document.getElementsByName("selectRound");
      for(var i=0;i<ele.length;i++)
          ele[i].checked = false;
      let radiobtn = document.getElementById(n);
      radiobtn.checked = true;
      this.select_round = n
    },
  
    askNames: function(){
      console.log(this.players);
      if (this.players < 6 && this.players > 1){
        for (let i = 0; i < this.players; i++){
          this.numberList.push({'name': "player"+i, 'key':i})
        }
        console.log(this.players);
        axios.put('/api/score/askNames', this.numberList)
        .catch(err => {console.log(err)});
        this.askNamesBool = true;
      }
    },

    generateTableHead: function() {
      for (let player of this.numberList){
        this.headers.push(player.name)
        this.headers.push(player.name + "'s " + "bet")
      }
    },

    fillTableData: function(){
      for (let row of this.tableData){
        for (let i=0; i < this.players; i++){
          // console.log(this.numberList)
          row[this.numberList[i]['name']+"score"] = 0;
          row[this.numberList[i]['name']+'bet'] = 0;
        }
      }
      axios.post("/api/score/saveTable", this.tableData)
    },

    fillRoundResultData: function(){
      for (let row of this.roundResults){
        for (let i=0; i < this.players; i++){
          // console.log(this.numberList)
          row[this.numberList[i]['name']+"bet"] = 0;
          row['complete'] = false;
        }
      }
      axios.post("/api/score/saveRoundResults", this.roundResults)
    },

    editTableData: function(round, key, newvalue){
      this.tableData[round][key] = newvalue;
      console.log(this.tableData)
    },
    
    submitBets: function(){
      var ele = document.getElementsByName("user");
      console.log(this.userInput);
      for(var i=0;i<ele.length;i++)
          ele[i].checked = false;
      let radiobtn = ele[1];
      radiobtn.checked = true;
      this.userInput = "winners"
    },

    decrement: function(){
      if (this.select_round > 1){
        this.p(this.select_round-1);
      }
    },

    increment: function(){
      if (this.select_round < 20){
        this.p(this.select_round+1);
      }
    },

    submitResults: function(){
      let items = document.getElementsByName('rr');
      this.roundResults[this.select_round-1]['complete'] = true;
      // console.log(items);
      for (let i = 0; i < items.length; i++){
        if (items[i].type != 'checkbox'){
          // console.log(items[i], 'cont');
          continue
        }
        if (!items[i].checked){
          // console.log(items[i], 'unchecked')
          this.roundResults[this.select_round-1][items[i].value+'bet'] = -1;
          continue;
        }

        this.roundResults[this.select_round-1][items[i].value+'bet'] = 1;
      }

      this.userInput = 'bet';
      this.increment();
      axios.post('/api/score/saveRoundResults', this.roundResults);
      this.updateScores();
    },

    // this.tableData = [{ "round": 1, "p0score": 0, "player0bet": 0, "p1score": 0, "player1bet": 0, "p2score": 0, "player2bet": 0, "p3score": 0, "player3bet": 0, "p4score": 0, "player4bet": 0 }
    // this.roundResults = [{'round': 1, 'player0bet': 1 or -1 or 0...}]
    updateScores: function(){

      for (let i = 0; i < this.tableData.length; i++ ){
        let round = this.tableData[i];
        let prevscore = 0
        if (i > 0){prevscore = this.tableData[i-1]}
        let roundWinners = this.roundResults[i]

        this.numberList.forEach(function(player){
          let name = player['name'];
          let bet = parseInt(round[name+'bet']);
          if (roundWinners[name+'bet'] === 1){
            console.log(prevscore)
            if (i === 0){round[name+'score'] = bet + 10}
            else if (i > 0){round[name+'score'] = prevscore[name+'score'] + bet + 10}
          } else if (roundWinners[name+'bet'] === -1){
            if (i > 0){round[name+'score'] = prevscore[name+'score']}
          }
          
        });

      }
      axios.post("/api/score/saveTable", this.tableData)
        .then(console.log("good")).catch(console.log("error on axios call in updateScores method"))
    },

  }

}

</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

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

.won{
  color:green !important
}

.lost{
  color:red !important
}


/* Radio Button
–––––––––––––––––––––––––––––––––––––––––––––––––– */
input[type=checkbox]:not(old),
input[type=radio   ]:not(old){
  width   : 1.3em;
  height: 1.3em;
  margin  : 2px;
  padding : 0;
}

input[type=radio]:hover,
input[type=checkbox]:hover{
  animation: bounce 1s;
}

@keyframes bounce {
	0%, 20%, 60%, 100% {
		-webkit-transform: translateY(0);
		transform: translateY(0);
	}

	40% {
		-webkit-transform: translateY(-5px);
		transform: translateY(-5px);
	}

	80% {
		-webkit-transform: translateY(-2.5px);
		transform: translateY(-2.5px);
	}
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


</style>