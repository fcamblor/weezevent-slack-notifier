var rp = require('request-promise');
var Promise = require('bluebird');


function Slack(opts){
    var self = this;
    
    self.slkHookUrl = opts.slkHookUrl;
    self.slkChannel = opts.slkChannel;
    self.slkUserName = opts.slkUserName;
    self.slkIcon = opts.slkIcon;
};

Slack.prototype.sendMessage = function(message){
    var self = this;
    
    return rp({
        uri: self.slkHookUrl,
        method: 'POST',
        body: {
            "channel": self.slkChannel,
            "username": self.slkUserName,
            "text": message,
            "icon_emoji": self.slkIcon
        },
        json: true
    });
};

module.exports = Slack;