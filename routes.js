"use strict";
const passport = require("passport")
const pug = require("pug");
const bcrypt = require("bcrypt");

module.exports = function(app, myDataBase){


app.route('/').get((req, res) => {
  //res.render(process.cwd()+'/views/pug/index.pug'
 res.render(process.cwd()+'/views/pug/index.pug',{
  title: "Home Page", 
  message: "Please login",
  showLogin: true,
  showRegistration: true,
  showSocialAuth: true
  });
});

app.route("/login").post(passport.authenticate('local',{failureRedirect: "/"}),(req, res)=>{
res.redirect("/profile")
});


app.route('/profile').get(ensureAuthenticated, (req, res)=>{
res.render(process.cwd()+'/views/pug/profile.pug', {username: req.user.username})  
});


app.route('/chat').get(ensureAuthenticated,(req, res, next)=>{
res.render(process.cwd()+'/views/pug/chat.pug', {user: req.user})
});


app.route("/logout").get((req, res)=>{
req.logout();
res.redirect('/');
});

app.route("/register").post((req, res, next)=>{
 const hash = bcrypt.hashSync(req.body.password, 12);

myDataBase.findOne({username: req.body.username}, function(err, user){
  if(err){
    next(err);
  }else if(user){
    res.redirect("/");
  }else{
 myDataBase.insertOne({
   username: req.body.username,
   password: hash //req.body.password
 }, (err, doc)=>{
   if(err){
     res.redirect('/')
   }else{
     next(null, doc.ops[0]);
   }
 }) 
  }
})  
}, passport.authenticate('local', {failureRedirect: '/'}), (req, res, next)=>{
  res.redirect("/profile")
});

app.route("/auth/github").get(passport.authenticate('github'));

app.route("/auth/github/callback").get(passport.authenticate('github', {failureRedirect: '/'}),(req, res, next)=>{
  req.session.user_id = req.user.id;
  res.redirect('/chat')
//res.redirect('/profile')
})

app.use((req, res, next)=>{
  res.status(404)
  .type("text")
  .send("Not Found")
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/")
};



} //module ends here

