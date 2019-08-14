const express = require('express');
const router = express.Router();
const Users = require('../models/Users');


/* GET home page. */
router.get('/:*', function(req, res) {
  res.render('index', { title: 'Ah Shit' });
});

router.get('/isSigned', (req, res)=> {
  if (!(req.session.scoreCard || req.session.playGame)) {
    res.status(401).json("You are not signed in").end();
    return;
  } else if (!req.session.scoreCard){ 
    res.status(200).json('playgame').end();
    return;
  } else if (!req.session.playGame){
    res.status(200).json('scorecard').end();
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

router.delete('/clearSession/:username', (req, res) => {
  req.session.playGame = false;
  req.session.scoreCard = false;
  req.session.presentForm = false;
  req.session.askNames = false;
  req.session.tableData = NaN;
  req.session.numberList = NaN;
  req.session.roundResults = NaN;
  console.log(req.session.username, req.params.username)
  if (req.session.username){
    Users.deleteUser(req.params.username);
    req.session.username = null;
  }
  res.status(200).end()
})


module.exports = router;