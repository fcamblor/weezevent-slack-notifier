var restify = require('restify');
var Promise = require('bluebird');
var WeezEvent = require('./wz');

var we = new WeezEvent({
  wzUser: process.env.WZ_USER,
  wzPwd: process.env.WZ_PWD,
  wzApi: process.env.WZ_API,
  wzEventId: process.env.WZ_EVT_ID
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
