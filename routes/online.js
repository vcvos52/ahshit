const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const CardDeck = require('../models/CardDeck');
const Trick = require('../models/Trick');
const Messages = require('../models/Messages');

router.post('/login', function(req, res) {
    req.session.username = req.body.name;
    req.session.logged = true;
    let newUser = new Users(req.body.name, []);
    Users.addUser(newUser);
    res.status(200).end();
  });

router.get('/all', function(req, res){
    let allin = Users.getAllInactive();
    res.status(200).send(allin).end();
});

router.put('/removeplayers', function(req, res) {
    let players = req.body;
    console.log(req.body);
    for (let i = 0; i < players.length; i++){
        let player = players[i];
        Users.activate(player.name);
    }
    res.status(200).end();
});

router.put('/addplayers', function(req, res){
    let players = req.body;
    for (let i = 0; i < players.length; i++){
        let player = players[i];
        try{
            Users.deactivate(player.name);
        } catch (err){
            continue;
        }
        
    }
    res.status(200).end();
});

router.get('/setdeck', function(req, res){
    req.session.round = 0;
    let deck = CardDeck.setDeck();
    let trump = CardDeck.getTrump();
    res.status(200).send([deck, trump]).end();
});


router.get('/getdeck', function(req, res){
    let deck = CardDeck.getDeck();
    let trump = CardDeck.getTrump();
    res.status(200).send([deck, trump]).end();
});

router.post('/setall', function(req, res){
    req.session.all = req.body;
    // console.log(req.body);
    res.status(200).end();
});

router.post('/setBaseAll', function(req, res){
    req.session.baseAll = req.body;
    res.status(200).end();
})

router.get('/getall', function(req, res){
    res.status(200).send(req.session.all).end();
});

router.get('/getBaseAll', function(req, res){
    res.status(200).send(req.session.baseAll).end();
});

/**
 * param: Number of cards to be dealt
 * returns: <List> list of card objects 
 */
router.get('/dealHand/:n', function(req, res){
    let hand;
    try{
        hand = CardDeck.dealCard(req.params.n);
        Users.setHand(req.session.username, hand);
    } catch (err) {
        console.log(err);
        res.status(401).end();
        return;
    }
    // console.log("HAND IN ONLINE ROUTE", hand);
    res.status(200).send(hand).end();
});

router.get('/getHand', function(req, res){
    let hand = Users.getHand(req.session.username);
    res.status(200).send(hand).end();
});

router.put('/updatehand', function(req, res){
    Users.setHand(req.session.username, req.body);
    res.status(200).end();
})


router.post('/setround/:round', function(req, res){
    req.session.round = req.params.round;
    res.status(200).send(req.session.round).end();
});

router.get('/getround/', function(req, res){
    res.status(200).json(req.session.round).end();
});

router.post('/createTrick', function(req, res){
    req.session.currentTrick = new Trick(req.body);
    console.log('------------------', req.session.currentTrick);
    res.status(200).end();
});

router.post('/addToTrick', function(req, res) {
    let currentTrick = req.session.currentTrick;
    Trick.addCard(currentTrick, req.body);
    res.status(200).end();
});

router.get('/getTrick', function(req, res) {
    let trick = req.session.currentTrick;
    console.log(trick);
    res.status(200).send(trick).end();
});

router.delete('/trick', function(req, res){
    req.session.currentTrick = new Trick(false);
    res.status(200).end();
});

router.post('/initTrick', function(req, res){
    req.session.currentTrick = new Trick(false);
    res.status(200).end();
});

router.post('/turnIndex/:index', function(req, res){
    req.session.turnIndex = req.params.index;
    res.status(200).end();
});

router.get('/turnIndex', function(req ,res){
    res.status(200).send(req.session.turnIndex).end();
});

router.post('/setBet', function(req, res){
    req.session.bet = true;
    req.session.play = false;
    res.status(200).end();
});

router.post('/setPlay', function(req, res){
    req.session.play = true;
    req.session.bet = false;
    res.status(200).end();
});

router.get('/betOrPlay', function(req, res){
    if (req.session.bet){
        res.status(200).send('bet').end();
    } else if (req.session.play){
        res.status(200).send('play').end();
    }
});

router.post('/messages', function(req, res){
    let message = req.body.message;
    let name = req.body.name;
    let newMessage = new Messages(name, message);
    Messages.addMessage(newMessage);
    res.status(200).send(newMessage).end();
});

router.get('/messages', function(req, res){
    let messages = Messages.getMessages();
    res.status(200).send(messages).end();
});

/**
 * sets deck to null
 */
router.delete('/endGame', function(req, res){
    CardDeck.endGame();
    res.status(200).end()
})

  module.exports = router;