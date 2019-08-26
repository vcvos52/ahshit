const express = require('express');
const router = express.Router();
const ScoreData = require('../models/ScoreData');

router.post('/saveTable', (req, res)=> {
    req.session.tableData = req.body;
    ScoreData.setData(req.body);
    console.log(req.session.tableData);
    res.status(200).end()
  });

  router.post('/saveRoundResults', (req, res)=> {
    req.session.roundResults = req.body;
    ScoreData.setRoundResults(req.body);
    // console.log(req.session.roundResults);
    res.status(200).end()
  });

  router.post('/addRoundResults', (req, res)=> {
      let round = req.body[0];
      let name = req.body[1];
      let tricksWon = req.body[2];
      let wager = req.body[3];
      let ifWin = ScoreData.addRoundResults(round, name, tricksWon, wager);
      // console.log(req.session.roundResults);
      res.status(200).send(ifWin).end();
  });

router.get('/getTable', (req, res) => {
    let table = ScoreData.getData();
    // console.log(table);
    res.status(200).send(table).end();
});

router.get('/getRoundResults', (req, res) => {
    res.status(200).send(ScoreData.getRoundResults()).end()
});

router.get('/status', (req, res) => {
    if (!(req.session.askNames || req.session.presentForm)) {
        res.status(401).json("You are not signed in").end();
        return;
    } else if (!req.session.presentForm){ 
        res.status(200).send(['askNames', req.session.numberList]).end();
        return;
    } else if (!req.session.askNames){
        res.status(200).send(['presentForm', req.session.numberList, req.session.tableData, req.session.roundResults]).end();
        return;
    }
});

router.put('/setForm', (req, res) => {
    req.session.numberList = req.body;
    req.session.presentForm = true;
    req.session.askNames = false;
    res.status(200).end()
});

router.put('/askNames', (req, res) => {
    req.session.numberList = req.body;
    req.session.presentForm = false;
    req.session.askNames = true;
    // console.log(req.session.numberList);
    res.status(200).send(req.session.numberList).end()
});

module.exports = router;