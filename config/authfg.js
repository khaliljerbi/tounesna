module.exports = {

    'facebookAuth' : {
        'clientID'      : 'YOUR_ID', 
        'clientSecret'  : 'YOUR_SECRET', 
        'callbackURL'   : 'CALLBACK URL',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] 
    },

    'googleAuth' : {
        'clientID'      : 'YOUR_ID',
        'clientSecret'  : 'YOUR_SECRET',
        'callbackURL'   : 'YOUR_URL'
    }
};