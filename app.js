const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const scoreCard = require('./routes/scoreCard');
const onlineRouter = require('./routes/online');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/dist'))); // Note

app.use(session({ secret: 'super-secret-password', saveUninitialized: false, resave: true }));

app.use('/', indexRouter);
app.use('/api/score', scoreCard);
app.use('/api/online', onlineRouter);
app.disable('etag');

module.exports = app;