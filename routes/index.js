const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const CardDeck = require('../models/CardDeck');
const ScoreData = require('../models/ScoreData');
const Messages = require('../models/Messages');

/* GET home page. */
router.get('/:*', function(req, res) {
  res.render('index', { title: 'Ah Shit' });
});

/**
 * this part is to get the booleans upon refresh in order to render correct page..
 * Leads up to game lobby...
 */
router.get('/isSigned', (req, res)=> {
  if (!(req.session.scoreCard || req.session.playGame)) {
    res.status(401).json("You are not signed in").end();
    return;
  } else if (req.session.playGame && req.session.logged){
    res.status(200).json('gogogo').end();
    return;
  } else if (!req.session.scoreCard){ 
    res.status(200).json('playgame').end();
    return;
  } else if (!req.session.playGame){
    res.status(200).json('scorecard').end();
    return;
  }
});

router.get('/username', (req, res) => {
  res.status(200).json(req.session.username).end();
})

/**
 * Populate booleans upon page refresh in game.
 * Leads to game itself.
 */
router.get('/isgamestarted', (req, res)=> {
  if (!req.session.gamestarted ) {
    res.status(401).json("You are not signed in").end();
    return;
  } else if (req.session.gamestarted){
    res.status(200).json('gamestarted').end();
    return;
  } 
});



router.post('/setScoreCard', (req, res)=> {
  console.log("in setScoreCard");
  req.session.scoreCard = true;
  req.session.playGame = false;
  res.status(200).end()
});

router.post('/setPlayGame', (req, res)=> {
  req.session.playGame = true;
  req.session.scoreCard = false;
  res.status(200).end()
});

router.post('/setGameStarted', (req, res)=> {
  req.session.gamestarted = true;
  res.status(200).end()
});

router.post('/setGameEnded', (req, res)=> {
  req.session.gamestarted = false;
  res.status(200).end()
});

router.get('/connected', (req, res) => {
  if (req.session.connected){
    console.log("hhh");
    res.status(200).send("yes").end();
  } else {
    console.log("ddd");
    res.status(200).send("no").end()
  }
});

router.post('/connect', (req, res) => {
  req.session.connected = true;
  res.status(200).end();
})


router.delete('/clearSession/:username', (req, res) => {
  CardDeck.endGame();
  ScoreData.endGame();
  Users.emptyHands();
  Messages.clearMessages();

  req.session.playGame = false;
  req.session.scoreCard = false;
  req.session.presentForm = false;
  req.session.askNames = false;
  req.session.tableData = null;
  req.session.numberList = null;
  req.session.roundResults = null;
  req.session.logged = false;
  req.session.gamestarted = false;
  req.session.round = 0;
  req.session.baseAll = null;
  req.session.currentTrick = [];
  console.log(req.session.username, req.params.username)
  if (req.session.username){
    Users.deleteUser(req.params.username);
    req.session.username = null;
  }
  req.session.destroy(err => {
    console.log(err)
  });
  res.status(200).end()
})


module.exports = router;