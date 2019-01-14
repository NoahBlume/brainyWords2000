/*
  Much of the basic application setup was guided by this tutorial: https://medium.com/createdd-notes/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359
*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));

const hbs = require('express-handlebars');
// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'default', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//use sessions for tracking logins
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { }
  // cookie: { secure: true }
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// include routes
const routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.send(err.message);
});


// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
