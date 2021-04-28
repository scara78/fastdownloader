const express = require('express');
const app = express();

const path = require('path');
const morgan = require('morgan');

const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./routes/index').router);

app.use((req, res, next) => {
  res.json({ error: 'Page not found' });
});

module.exports = {app};