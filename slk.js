var rp = require('request-promise');
var Promise = require('bluebird');


function Slack(opts){
    var self = this;
    
    self.slk_hook_url = opts.slk_hook_url;
    self.slk_channel = opts.slk_channel;
    self.slk_user_name = opts.slk_user_name;
    self.slk_icon = opts.slk_icon;
};

Slack.prototype.sendMessage = function(message){
    var self = this;
    
    return rp({
        uri: self.slk_hook_url,
        method: 'POST',
        body: {
            "channel": self.slk_channel,
            "username": self.slk_user_name,
            "text": message,
            "icon_emoji": self.slk_icon
        },
        json: true
    });
};

module.exports = Slack;