const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const CardDeck = require('../models/CardDeck');

router.post('/login', function(req, res) {
    req.session.username = req.body.name;
    let newUser = new Users(req.body.name);
    Users.addUser(newUser);
    res.status(200).end();
  });

router.get('/all', function(req, res){
    let all = Users.getAllInactive();
    res.status(200).send(all).end();
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
    let deck = CardDeck.setDeck();
    res.status(200).send(deck).end();
});

router.get('/newdeck', function(req, res){
    let deck = CardDeck.newRound();
    res.status(200).send(deck).end();
});

router.get('/getHand/:n', function(req, res){
    let hand;
    try{
        hand = CardDeck.dealCard(req.params.n);
    } catch (err) {
        console.log(err);
        res.status(401).end();
        return;
    }
    console.log("HAND IN ONLINE ROUTE", hand);
    res.status(200).send(hand).end();
});

router.delete('/endGame', function(req, res){
    CardDeck.endGame();
    res.status(200).end()
})

  module.exports = router;