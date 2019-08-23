let deck = null;

rank_names = ['2', '3', '4', '5', '6', '7', '8', '9', '10',
              'J', 'Q', 'K', 'A']

suit_names = ['C', 'D', 'H', 'S']

class Card{

    constructor(rank, suit){
        this.rank = rank;
        this.suit = suit;
    }

    static getRank(){
        return this.rank;
    }

    static getSuit(){
        return this.suit;
    }
}


class CardDeck{

    constructor(){
        let c = []
        this.trump = null;
        for (let i=0; i< rank_names.length; i++){
            for (let j=0; j<suit_names.length; j++){
                c.push(new Card(rank_names[i], suit_names[j]));
            }
        }
        this.cards = CardDeck.shuffle(c);
        this.trump = this.cards.pop();
    }

    static dealCard(n){
        let hand = []
        for (let i = 0; i<n; i++){
            hand.push(deck.cards.pop())
        }
        return hand;
    }

    static setTrump(){
        deck.trump = deck.cards.pop();
    }

    static getTrump(){
        return deck.trump;
    }

    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    static setDeck(){
        if (deck){
            if (deck.cards.length > 50){
                return deck;
            }
        }
        deck = new CardDeck();
        return deck
    }

    static getDeck(){
        return deck;
    }

    static endGame(){
        deck = null;
    }
}

module.exports = CardDeck;