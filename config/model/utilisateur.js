var mongoose= require('mongoose');
var bcrypt = require('bcrypt-nodejs'); 

var userSchema= new mongoose.Schema({

    
        name:String,
        email: String,
        tel:String,
        password:String,
        grade:String,
        idfb:String,
        tokenfb:String,
        idgoogle:String,
        tokengoogle:String,
        resetPasswordToken:String,
        resetPasswordExpires:Date
    
});
userSchema.pre('save', function(next) {
        var user = this;
        var SALT_FACTOR = 8;
      
        if (!user.isModified('password')) return next();
      
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
          if (err) return next(err);
      
          bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
          });
        });
      });

/*userSchema.methods.generateHash=function(password){
return bcrypt.hashSync(password,bcrypt.genSaltSync(8));
};*/

userSchema.methods.validPassword= function(password){
return bcrypt.compareSync(password,this.password);
};

module.exports=mongoose.model('User',userSchema);