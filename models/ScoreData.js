data = null;
RoundResults = null;

class ScoreData{

    /**
     * 
     * @param {List} data [{round:n, <player0>score:x, <player0>bet:x, ...}, ...]  
     */
    constructor(data, names){
        this.data = data; // Keep raw data, just in case...
        this.playerNames = names; // list of dicts containing player names
        this.players = []; // List of all of the players in the game
        this.playerBets = {}; // Dictionary mapping player name to list of bets: {<player name>: [bet for bet in players bets]}
        this.playerScores = {}; // Dictionary mapping player name to list of scores: {<player name>: [score for score in players score]}

        for (let i=0; i < this.playerNames.length; i++){
            let nameData = this.playerNames[i];
            this.players.push(nameData['name']);
            this.playerBets[nameData['name']] = [];
            this.playerScores[nameData['name']] = [];
        }

        for (let i=0; i < this.data.length; i++){
            let round = this.data[i];
            for (let j = 0; j < this.playerNames.length; j++){
                let itername = this.playerNames[j]['name'];
                this.playerBets[itername].push(round[itername+'bet']);
                this.playerScores[itername].push(round[itername+'score']);
            }
        }
    }

    /**
     * 
     * @param {integer} n indexes the data list to get the data for that round 
     * @returns {dictionary} a shallow copy of that index in this.data
     */
    static getRound(n){
        return Object.assign({}, this.data[n])
    }

    /**
     * safely returns all of the data
     */
    static getData(){
        return data;
    }

    /**
     * safely returns all of the data
     */
    static getRoundResults(){
        return RoundResults;
    }


    static setData(tableData){
        data = tableData;
    }


    static setRoundResults(tableData){
        RoundResults = tableData;
    }

    static addRoundResults(round, name, tricksWon, wager){
        if (parseInt(wager, 10) === tricksWon){
            RoundResults[round][name+'bet'] = 1;
            return true;
        } else {
            RoundResults[round][name+'bet'] = -1;
            return false;
        }
    }


    /**
     * safely returns the player names list.
     */
    static getNames(){
        return this.playerNames;
    }

    static endGame(){
        data = null;
        RoundResults = null;
    }

}

module.exports = ScoreData;