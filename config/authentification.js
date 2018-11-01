var LocalStrategy= require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User  =require('./model/utilisateur');

var configAuth = require('./authfg');

module.exports=function(passport){
 
    passport.serializeUser(function(user,done){
        done(null,user.id);
    });

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    });
});

passport.use('local-signup', new LocalStrategy({
  
    usernameField : 'i_email',
    passwordField : 'i_mdp',
    passReqToCallback : true 
},
function(req, i_email,i_password, done) {

    
    process.nextTick(function() {


    User.findOne({ 'email' :  i_email }, function(err, user) {
      
        if (err)
            return done(err);

      
        if (user) {
            return done(null, false, req.flash('signupMessage', 'Email existe déjà.'));
        } else {

            var newUser            = new User();

            
            newUser.email    = i_email;
            newUser.password = i_password;   //newUser.generateHash(i_password)
            newUser.name=req.body.i_nom + " "+req.body.i_prenom ;
            
            newUser.tel=req.body.i_tel;
            newUser.grade=0;
          
            newUser.save(function(err) {
                if (err)
                    throw err;
                
                return done(null, newUser);
            });
        }

    });    

    });

}));

passport.use('local-login', new LocalStrategy({
   
    usernameField : 'l_email',
    passwordField : 'l_pass',
    passReqToCallback : true
},
function(req, email, password, done) {
    
   
    User.findOne({ 'email' :  email }, function(err, user) {
     
        if (err)
            return done(err);

     
        if (!user)
            return done(null, false, req.flash('loginMessage', 'Utilisateur introuvable!'));

      
        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Mot de passe incorrect!')); 
        

        return done(null, user);
    });
     

}));
passport.use(new FacebookStrategy({

  
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL,
    profileFields   : configAuth.facebookAuth.profileFields

},


function(token, refreshToken, profile, done) {

    
    process.nextTick(function() {

       
        User.findOne({ 'idfb' : profile.id }, function(err, user) {

           
            if (err)
                return done(err);

           
            if (user) {
                return done(null, user); 
            } else {
                
                var newUser            = new User();

             
                newUser.idfb    = profile.id;                 
                newUser.tokenfb = token;           
                newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                newUser.email = profile.emails[0].value; 
                newUser.grade=0;
               
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    
                    return done(null, newUser);
                });
            }

        });
    });

}));
passport.use(new GoogleStrategy({

    clientID        : configAuth.googleAuth.clientID,
    clientSecret    : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL,

},
function(token, refreshToken, profile, done) {

  
    process.nextTick(function() {

        
        User.findOne({ 'idgoogle' : profile.id }, function(err, user) {
            if (err)
                return done(err);

            if (user) {

               
                return done(null, user);
            } else {
               
                var newUser          = new User();

                
                newUser.idgoogle   = profile.id;
                newUser.tokengoogle = token;
                newUser.name  = profile.displayName;
                newUser.email = profile.emails[0].value; 
                newUser.grade=0;
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    });

}));


};