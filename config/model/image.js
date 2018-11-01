var mongoose= require('mongoose');
var bcrypt = require('bcrypt-nodejs'); 

var imageSchema= new mongoose.Schema({

    lien:String,
    id_monument:String
    
});


module.exports=mongoose.model('image',imageSchema);