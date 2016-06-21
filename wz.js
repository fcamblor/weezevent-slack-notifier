var rp = require('request-promise');
var _ = require('lodash');
var Promise = require('bluebird');

function WeezEvent(opts){
    var self = this;

    self.wz_user = opts.wz_user;
    self.wz_pwd = opts.wz_pwd;
    self.wz_api = opts.wz_api;
    self.wz_event_id = opts.wz_event_id;

    self.wz_access_token = null;
};

WeezEvent.prototype.init = function(opts){
    var self = this;
    
    // Retrieving weezevent access token given user/password
    return rp({
        uri: 'https://api.weezevent.com/auth/access_token',
        method: 'POST',
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
            "id_event[]": self.wz_event_id,
            full: 1,
            max: 512
        },
        json: true
    }).then(function (results) {
        console.log(JSON.stringify(results));
        return results.participants;
    });
};

function fillTicketsFromNode(tickets, categoryNode) {
    tickets.push.apply(tickets, categoryNode.tickets || []);

    if(categoryNode.categories) {
        _.each(categoryNode.categories, function(categorySubNode) {
            fillTicketsFromNode(tickets, categorySubNode);
        });
    }
}

WeezEvent.prototype.fetchWZEventTickets = function() {
    var self = this;

    return rp({
        uri: 'https://api.weezevent.com/tickets',
        qs: {
            access_token: self.wz_access_token,
            api_key: self.wz_api,
            "id_event[]": self.wz_event_id
        },
        json: true
    }).then(function (results) {
        console.log(JSON.stringify(results));

        var flattenedTickets = [];
        _.each(results.events, function(event) {
            fillTicketsFromNode(flattenedTickets, event);
        });

        return flattenedTickets;
    });
};


module.exports = WeezEvent;
