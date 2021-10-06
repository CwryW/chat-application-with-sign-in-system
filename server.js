'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const auth = require('./auth.js');

const app = express();
/*
Cross-Origin-Resource-Sharing allows requests from one website to another in the browser,
which is normally prohited by anotrher browser policy(SOP).
Same-Origin-Policy

*/
const cors = require("cors");
app.use(cors());
//http server mounted on the express app
const http = require('http').createServer(app);
/*
io() works only when connecting to another socket hosted on the same url/server.
Eternal socket hosted elsewhere use io.connect('URL')
*/
const io = require('socket.io')(http);

const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI});


app.set('view engine', 'pug');

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
secret: process.env.SESSION_SECRET,
resave: true,
saveUninitialized: true,
cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.SESSION_SECRET,
  store: store,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}))


myDB(async (client) => {
const myDataBase = await client.db('db1').collection('users');

routes(app, myDataBase);
auth(app, myDataBase);
 
  //keep track of users
let currentUsers = 0;  
//listen for connections to server
io.on('connection', (socket) => {
//socket is an individual client who is connected
  
console.log('A user has connected');
  ++currentUsers;
  io.emit('user', {
    name: socket.request.user.name,
                   currentUsers,
  connected: true
  }); 
  console.log('user '+ socket.request.user.name + ' has connected');
  
  socket.on('chat message', (message)=>{
   io.emit('chat message', {
     name: socket.request.user.name,
     message
   }) 
  })
  
  socket.on('disconnect', ()=>{
    console.log("A user has disconnected");
    --currentUsers;
   io.emit('user', {name: socket.request.user.name,
                    currentUsers,
                   connected: false
                   }) 
  })
});
}).catch((e) => {
app.route('/').get((req, res) => {
res.render('pug', { title: e, message: 'Unable to login' });
});
});

function onAuthorizeSuccess(data, accept){
console.log('successful connection to socket.io');
  accept(null, true)  
};

function onAuthorizeFail(data, message, error, accept){
  if(error) throw new Error(message)
console.log('Failed connection to socket.io', message);
  accept(null, false)
}


const PORT = process.env.PORT || 3000;

//app.listen()
//listen from the http server
http.listen(PORT, () => {
console.log('Listening on port ' + PORT);
});
