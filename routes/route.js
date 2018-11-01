var express=require('express');
var nodemailer = require('nodemailer');
var smtptranporter= require('nodemailer-smtp-transport');
var mongoose= require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs'); 
var ObjectId = mongoose.Types.ObjectId;
var Grid=require('gridfs-stream');
var xoauth2= require('xoauth2');
var GridFsStorage = require('multer-gridfs-storage');
var Db=require('../config/database');
var dbUrl  = Db.url || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL;
var multer= require('multer');
var path =require('path');
var crypto =require('crypto');
var async = require('async');
var util= require('../config/model/utilisateur');
var monument  =require('../config/model/monument');
var imagemon  =require('../config/model/image');
var commentaire  =require('../config/model/commentaire');
var port = process.env.port || 8000;
module.exports=function(app,passport,io){

  mongoose.connect(dbUrl);
var Scon= mongoose.connection;
Scon.on('err',function(err){
console.log('erreur lors de la connexion à la base de données de type:'+err);
});
let gfs;
Scon.once('open',function(){
    gfs=Grid(Scon.db,mongoose.mongo);
    gfs.collection('uploads');
    console.log('connexion à la base de données effectuée avec succés');
});
// home

app.get('/',function(req,res){
  

  var mon=[];
  monument.find({}).then(function(monument){
    var item=[];
    
    monument.forEach(function(element){
      item.push(imagemon.findOne({'id_monument':ObjectId(element._id)}));
      mon.push(element);
      
       
    });
    
    return Promise.all(item);
          
     }).then(function(listimage){
      
  
     res.render('index',{user:req.user,monument:mon,images:listimage}); 
     }).catch(function(error) {
      res.status(500).send(error);
  });
 
     

    
});
app.post('/',(req,res) =>
{
ville=req.body.ville ;


/*

*/
res.redirect('/gallerie/'+ville);  

});

//login local
app.get('/login',function(req,res){
  if (req.session.user){
    res.redirect('/');}
    else {
  res.render('login',{message:req.flash('loginMessage')});}
  });
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', 
    failureRedirect : '/login',
    failureFlash : true 
  }));

//login facebook
app.get('/auth/facebook', passport.authenticate('facebook', { 
	scope : ['public_profile', 'email']
  }));
  app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));
		// google

	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                   
                    failureRedirect : '/login'
            }),function(req,res){
              req.session.token = req.user.token;
              console.log(req.user.token);
              res.redirect('/');
            });


//inscription
app.get('/inscription',function(req,res){
  if (req.session.user){
  res.redirect('/');}
  else {
    res.render('inscription',{message:req.flash('signupMessage'),user:req.user});}
});
app.post('/inscription', passport.authenticate('local-signup', {
	successRedirect : '/', 
	failureRedirect : '/inscription', 
	failureFlash : true 
}));
//***************************************test test test **************************************//
/*
app.get('/profile',function(req,res){
  if(!req.session.user){
  res.redirect('/login');}
  else{
  res.render('contact');}
});*/

//*********************************************************************************************/
const storage = new GridFsStorage({
  url: Db.url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({storage });
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'Le fichier n existe pas!'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Le fichier doit être une image !'
      });
    }
  });
});
// detail monument
app.get('/monument/:id', (req, res) => {
 


  var mon;
  monument.find({'_id' :req.params.id}).then(function(monument){
    var item=[];
    
    monument.forEach(function(element){
      item.push(imagemon.find({'id_monument':ObjectId(element._id)}));
      mon=element;
      
       
    });
    
    return Promise.all(item);
          
     }).then(function(listimage){
      commentaire.find({'id_monument':req.params.id}, function (err, comments) {
        
           
        res.render('detailsT',{user:req.user,monument:mon,images:listimage,comment:comments}); 
    });
      
    
     }).catch(function(error) {
      res.status(500).send(error);

     });


});
app.get('/supprimer/:id', (req, res) => {
 
var id;

imagemon.findOne({'lien':req.params.id}, function (err, img) {
       id= img.id_monument;
       imagemon.find({ 'lien':req.params.id  }).remove().exec();
           
       res.redirect('/monument/'+id);  
 
    });
      
    
    


});


app.get('/supp/:id', (req, res) => {
 monument.find({ '_id':req.params.id  }).remove().exec();
             res.redirect('/gallerie');  
  });



// commentaire
io.on('connection',function(socket){

  socket.on('comment',function(data){
      var commentData = new commentaire(data);
      commentData.save();
     
      socket.broadcast.emit('comment',data);  
  });

});
// tous les monuments
app.get('/gallerie',function(req,res){
  


  var mon=[];
  monument.find({}).then(function(monument){
    var item=[];
    
    monument.forEach(function(element){
      item.push(imagemon.findOne({'id_monument':ObjectId(element._id)}));
      mon.push(element);
      
       
    });
    
    return Promise.all(item);
          
     }).then(function(listimage){
      
  
     res.render('gallerie',{user:req.user,monument:mon,images:listimage}); 
     }).catch(function(error) {
      res.status(500).send(error);
  });
 
     

    
});

app.get('/gallerie/:ville', (req,res) =>
{   
  var mon=[];
monument.find({'ville':req.params.ville}).then(function(monument){
  var item=[];
  
  monument.forEach(function(element){
    item.push(imagemon.findOne({'id_monument':ObjectId(element._id)}));
    mon.push(element);
    
     
  });
  
  return Promise.all(item);
        
   }).then(function(listimage){
    

   res.render('gallerie',{user:req.user,monument:mon,images:listimage}); 
   }).catch(function(error) {
    res.status(500).send(error);
});

});

//ajouter monuments
app.get('/ajoutmon',function(req,res){
 
 if ((!req.user) || (req.user.grade!="1")) {
    res.redirect('/');
    }
    else {
      res.render('ajoutmon',{data:req.session.user,user:req.user});
    }
});
app.get('/modifmon/:id',function(req,res){
 
  if ((!req.user) || (req.user.grade!="1")) {
     res.redirect('/');
     }
     else {
      monument.findOne({'_id':req.params.id}, function (err, mon) {
        
           
        res.render('modifmon',{user:req.user,monument:mon}); 
    });
  }
 });

 app.post('/modifmon/:id',upload.array('file_source',10), function(req,res){
  
monument.update({_id: req.params.id}, {'nom':req.body.nommon,'ville':req.body.ville,'cla':req.body.cla,'clo':req.body.clo,
'description':req.body.description,'video':req.body.video}, function(err, raw) {
    if (err) {
      res.send(err);
    }
    req.files.forEach(element => {
          
          
      var image=new imagemon({'lien':element.filename,'id_monument': req.params.id}).save();
      });   
      res.redirect('/monument/'+req.params.id);
    });
  });

  
    
                   
                     
   
app.post('/ajoutmon',upload.array('file_source',10), function(req,res){
  
 

  var mon=new monument({'nom':req.body.nommon,'ville':req.body.ville,'cla':req.body.cla,'clo':req.body.clo,'description':req.body.description,'video':req.body.video}).save(function(err,room) {
    
          req.files.forEach(element => {
          
          
          var image=new imagemon({'lien':element.filename,'id_monument':room.id}).save();
          });   
                     
                   
                     res.redirect('/gallerie');
    });
     
 });
 
//contact
var transporter = nodemailer.createTransport(smtptranporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      xoauth2: xoauth2.createXOAuth2Generator({
        user: 'wow125689@gmail.com',
        clientId: 'YOUR_ID',
        clientSecret: 'YOUR_SECRET',
        refreshToken: 'TOKEN',
        accessToken: 'ACCESS TOKEN'
    })
    }
  }));

app.get('/contact',function(req,res){
    res.render('contact',{user:req.user});
});

app.post('/contact',function(req,res){
   var mailOptions = {
        from:  req.body.e_contact,
        to: 'wow125689@gmail.com',
        subject: req.body.o_contact,
        text:"de: "+req.body.e_contact+" \n"+ req.body.d_contact
      };
      var mailOptions2={
      from:'wow125689@gmail.com',
      to:req.body.e_contact,
      subject:'Confirmation réception',
      text:'Nous avons bien reçu votre email , nous vous contacterons sur l adresse : '+ req.body.e_contact+ ' dés que possile !'

      };
       
      transporter.sendMail(mailOptions, function(error, info){
       
       
        
          transporter.sendMail(mailOptions2,function(error,inf){
          console.log('email envoyé');
    

          });
       
          
      });
      req.flash('success','Merci de nous avoir contacter , une e-mail a été envoyé à l adresse '+req.body.e_contact+' pour confirmer la réception du mail.');

    res.redirect('/');
  
});
// forgot 
app.get('/forgot',(req,res)=>{
  if (req.user){
    res.redirect('/');
  }
  else {
res.render('forgot',{user:req.user});
}
});

app.post('/forgot',(req,res,next)=>{
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      util.findOne({ email: req.body.mail }, function(err, user) {
        if (!user) {
          req.flash('error', 'Cet email n exite pas, recommencez!');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      
      var mailOptions = {
        to: user.email,
        from: 'wow125689@gmail.com',
        subject: 'Réinitialisation du mot de passe',
        text: 
          'Vous avez demandé à ce que votre email soit rénitialiser , cliquez sur ce lien pour étre rediriger vers la page de réinitialisation:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' 
      };
      transporter.sendMail(mailOptions, function(err) {
        console.log('email envoyé !');
        req.flash('success', 'Un email a été envoyé à  ' + user.email + ', vérifiez votre boîte mail pour plus d informations!');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });

});
 // reset
 app.get('/reset/:token', function(req, res) {
 util.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Le token a expiré , vous devez refaire une demande de réinitialisation!');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token,user:req.user});
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      util.findOne({ resetPasswordToken:req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Le token est invalide ou a expiré !');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirmation) {
            user.password=req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          
        } else {
            req.flash("error", "Vérifiez votre mot de passe , les 2 champs ne sont pas identiques!");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'wow125689@gmail.com',
        subject: 'Changement de mot de passe',
        text: ',\n\n' +
          'Ceci est une confirmation que votre mot de passe sur le mail: ' + user.email + ' a été changé.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', 'Votre mot de passe a été changé avec succes!');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

//deconnexion
app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    if (err) console.log(err);
    res.redirect('/'); 
  });
});
app.use(function(req, res, next){
  res.status(404).render('404',{user:req.user});
});
};
