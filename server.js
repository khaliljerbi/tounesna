var express= require('express');
var app=express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var morgan= require('morgan');
var flash= require('connect-flash');
var passport= require('passport');
var cookieParser=require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser= require('body-parser');
var session= require('express-session');
var methodOverride=require('method-override');
var port= process.env.PORT || 8000;
var routeRouter= require('./routes/route');
var Db=require('./config/database');
//
app.set('view engine','ejs');
app.use('/assets',express.static('assets'));

//config
app.use(morgan('dev'));
app.use(bodyParser.json()); 
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
secret:'YOUR_SECRET',
resave: true,
saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=>{
res.locals.success=req.flash('success');
res.locals.loginMessage=req.flash('loginMessage');
res.locals.error=req.flash('error');
next();
});
// passport 
require('./config/authentification')(passport);
//routes

require('./routes/route')(app,passport,io);


// port serveur
http.listen(port,function(){
    console.log('Application active sur le port: '+port);
});
