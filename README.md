# Weezevent-slack-notifier

NodeJS application intended to notify `Incoming WebHooks` slack bot to publish a message everytime new participants
are added to a Weezevent event.

# Setup

You can deploy the app as is on an IaaS such as Heroku (free app).

You will need a small mongodb database in order to be able to persist participants from one call to another. 

Mongolab 500MB free instances are largely enough for this purpose. 

You will have to define following environment variables :

  - WZ_USER / WZ_PWD: Weezevent existing user credentials
  - WZ_API : You need to request yours by sending an email to contact@weezevent.com
  - WZ_EVT_ID : Event you want to watch for new participants. This event id may be retrieved by looking at weezevent url when looking at an event
  - SLK_HOOK_URL : You will need to setup an [Incoming Webhook bot](https://api.slack.com/incoming-webhooks) on your slack domain
    Once done, you will have a hook URL like this one : 
    `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`
    This is the SLK_HOOK_URL

  - SLK_USERNAME : The name the bot will take while publishing the notification
  - SLK_ICON : The emoji the bot will take while publishing the notification
  - MNG_URL : A mongodb url such as `mongodb://myuser:myapikey@mynode.mlab.com:19624/my-db`


# How it works

When starting the app, a weezevent handshake will be made to retrieve an API access token which will be used in subsequent calls.

Everytime a `GET /checkParticipants` request will be made, following steps will be executed :

  - Previously persisted participants will be retrieved from MongoDB storage
  - Current participants list will be retrieved from Weezevent
  - New participants appeared will be identified by diff-ing the 2 lists
  - As long as at least 1 new participant is detected, a message will be sent to Slack bot in order to list new participants
    (obviously, if no new participant is detected, slack bot won't say anything)


Note that no CRON is made : the check is made only on every request.

You can use `Cron as a Service` providers such as https://crondash.com (free) to trigger the checks at different period of time, with maybe different frequencies depending on the current day hour.


# Known limitations

Currently, cancelled & refunded tickets are not handled (not that it would be very difficult to handle, but this case has never happened for BDX I/O, so I didn't considered it as worth to implement, but PR are welcome :-))

We have some things which may be interesting to have more configurable in order to encourage configuration rather than forking the project to change some area of the code, particularly :
- [The message displayed by the bot](https://github.com/fcamblor/weezevent-slack-notifier/blob/master/msgProducer.js#L22)
- Weezevent attendee's company which is retrieved, currently, through a ["dynamic answer" named "Societe"](https://github.com/fcamblor/weezevent-slack-notifier/blob/master/msgProducer.js#L62)
