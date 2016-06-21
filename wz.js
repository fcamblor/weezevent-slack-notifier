var rp = require('request-promise');
var Promise = require('bluebird');

function WeezEvent(opts){
    var self = this;

    self.wz_user = opts.wz_user;
    self.wz_pwd = opts.wz_pwd;
    self.wz_api = opts.wz_api;
    self.wz_evt_id = opts.wz_event_id;

    self.wz_access_token = null;
};

WeezEvent.prototype.init = function(opts){
    var self = this;
    
    // Retrieving weezevent access token given user/password
    return rp({
        uri: 'https://api.weezevent.com/auth/access_token',
        qs: {
            username: self.wz_user,
            password: self.wz_pwd,
            api_key: self.wz_api
        },
        json: true
    }).then(function(result){
        self.wz_access_token = result.accessToken;
        
        console.log('Weezevent access token retrieved : %s', result.accessToken);
        return Promise.resolve();
    }).catch(function(err){
        console.error("Error while retrieving Weezevent Access Token : %s", err);
        return Promise.rejected("Error while retrieving Weezevent Access Token");
    });
};


WeezEvent.prototype.fetchWZParticipants = function() {
    var self = this;
    
    return rp({
        uri: 'https://api.weezevent.com/participants',
        qs: {
            access_token: self.wz_access_token,
            api_key: self.wz_api,
            id_event: self.wz_evt_id,
            full: 1,
            max: 512
        },
        json: true
    }).then(function (results) {
        console.log(JSON.stringify(results));
        return results.participants;
    });
};


module.exports = WeezEvent;
