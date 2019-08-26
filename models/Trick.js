let TRICK = null;

class Trick{
    
    constructor(leadCard){
        if (leadCard){
            this.lead = leadCard
            this.cards = [leadCard];
        } else {
            this.lead = null;
            this.cards = [];
        }
    }

    static addCard(trick, card){
        trick.cards.push(card);
    }
}




module.exports = Trick;