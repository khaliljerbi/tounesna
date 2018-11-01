var mongoose= require('mongoose');
var bcrypt = require('bcrypt-nodejs'); 

var commentaireSchema= new mongoose.Schema({
    
    id_user:String,
    id_monument:String,
    message:String,
    name:String,
    date:Date
    
});


module.exports=mongoose.model('commentaire',commentaireSchema);