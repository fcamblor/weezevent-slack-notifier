var restify = require('restify');
var Promise = require('bluebird');
var _ = require('lodash');
var WeezEvent = require('./wz');
var Slack = require('./slk');

var requiredEnvKeysFilled = true;
_.each(['WZ_USER', 'WZ_PWD', 'WZ_API', 'WZ_EVT_ID', 'SLK_HOOK_URL', 'SLK_USERNAME', 'SLK_ICON'], function(requiredEnvKey){
  if(!process.env[requiredEnvKey]) {
    console.error("Missing mandatory environment key : %s", requiredEnvKey);
    requiredEnvKeysFilled = false;
  }
});
if(!requiredEnvKeysFilled) {
  process.exit();
}

var we = new WeezEvent({
  wz_user: process.env.WZ_USER,
  wz_pwd: process.env.WZ_PWD,
  wz_api: process.env.WZ_API,
  wz_event_id: process.env.WZ_EVT_ID
});
var slk = new Slack({
  slk_hook_url: process.env.SLK_HOOK_URL,
  slk_channel: process.env.SLK_CHANNEL,
  slk_user_name: process.env.SLK_USERNAME,
  slk_icon: process.env.SLK_ICON
});


var server = restify.createServer({
  name: 'weezevent-slack-notifier',
  version: '1.0.0'
});
server.get('/checkTickets', function (req, res, next) {
  Promise.all([
    we.fetchWZTickets()
  ]).then(function(wzTickets){
    console.log("WZTickets : %s", JSON.stringify(wzTickets));

    slk.sendMessage("Hello world !");
  });
  return next();
});


we.init().then(function(){
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.listen(parseInt(process.env.PORT, 10) || 8080, function () {
    console.log('%s listening at %s', server.name, server.url);
  });
});
