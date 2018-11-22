var restify = require('restify');
var Promise = require('bluebird');
var _ = require('lodash');
var WeezEvent = require('./wz');
var Slack = require('./slk');
var Store = require('./store');
var SlackMessageProducer = require('./msgProducer');

var requiredEnvKeysFilled = true;
_.each(['WZ_USER', 'WZ_PWD', 'WZ_API', 'WZ_EVT_ID', 'SLK_HOOK_URL', 'SLK_USERNAME', 'SLK_ICON', 'MNG_URL'], function(requiredEnvKey){
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
var store = new Store({
  mongo_url: process.env.MNG_URL
});
var msgProducer = new SlackMessageProducer();

var server = restify.createServer({
  name: 'weezevent-slack-notifier',
  version: '1.0.0'
});
server.get('/checkParticipants', function (req, res, next) {
  Promise.all([
    we.fetchWZParticipants(),
    we.fetchWZEventTickets(),
    store.fetchPersistedParticipants("bdxio")
  ]).then(function(promResults) {
    var wzParticipants = promResults[0];
    var wzTickets = promResults[1];
    var bdxioParticipants = msgProducer.convertWZParticipantsToBDXIOParticipants(wzParticipants, wzTickets);
    var persistedParticipants = promResults[2] || [];
      
    console.log("wzParticipants: %s", JSON.stringify(bdxioParticipants));
    console.log("persistedParticipants : %s", JSON.stringify(persistedParticipants));

    var slackMsg = msgProducer.produceMessageFrom(persistedParticipants, bdxioParticipants);
    if(slackMsg){
        slk.sendMessage(slackMsg);
        store.persistParticipantsIn("bdxio", bdxioParticipants);
    }
  }, (error) => console.error(error));
  res.send(200)
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
