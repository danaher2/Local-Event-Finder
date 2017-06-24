/* This code has been generated from your interaction model

/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the contents as the code for a new Lambda function, using the alexa-skill-kit-sdk-factskill template.
// This code includes helper functions for compatibility with versions of the SDK prior to 1.0.9, which includes the dialog directives.



 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function
var speechOutput;
var reprompt;
var welcomeOutput = "Welcome to event finder. Try saying something like, show me technology events near boston next week to hear a list of events.";
var welcomeReprompt = "Try saying something like, show me amazon alexa events near boston next month.";

 // 2. Skill Code =======================================================================================================
"use strict";
var Alexa = require('alexa-sdk');
var config = require('./config'); // Config file contains the Alexa App ID and the Eventbrite API Token
var APP_ID = config.appID;
var speechOutput = '';
var TopicSlot;
var LocationSlot;
var DateRangeSlot;
var handlers = {
    'LaunchRequest': function () {
          this.emit(':ask', welcomeOutput, welcomeReprompt);
    },
	'AMAZON.HelpIntent': function () {
        speechOutput = 'Try saying something like, show me amazon alexa events near boston next month. For timeframes, you can say this week, next week, this weekend, this month, next month, today, or tomorrow.';
        reprompt = '';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = 'OK, OK. Im Cancelling!';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        speechOutput = '';
        this.emit(':tell', speechOutput);
    },
    'SessionEndedRequest': function () {
        speechOutput = '';
        this.emit(':tell', speechOutput);
    },
	"GetEventsIntent": function () {
        //delegate to Alexa to collect all the required slot values
        // var filledSlots = delegateSlotCollection.call(this);
		var speechOutput = "";
    	//any intent slot variables are listed here for convenience
		TopicSlot = this.event.request.intent.slots.Topic.value;
		console.log(TopicSlot);
		LocationSlot = this.event.request.intent.slots.Location.value;
		console.log(LocationSlot);
		DateRangeSlot = this.event.request.intent.slots.DateRange.value;
		console.log(DateRangeSlot);

        possibleDateRanges = ['this week','next week','this weekend','next month','this month','tomorrow','today',];
        if (possibleDateRanges.indexOf(DateRangeSlot.toLowerCase()) === -1) DateRangeSlot = 'next week';

        getEvents((events) => {
                console.log('Found ' + events.length + ' events.');
                this.attributes['currentIndex'] = 0;
                speechOutput = 'I found ' + events.length + ' events. The first one is called ' + events[0].name.text + '. Say tell me more to hear more about this event or next to move to another event.';
                this.emit(":ask",speechOutput);
            }
        );

    },
    "NextEventIntent": function () {
		var speechOutput = "";
        var currentIndex = this.attributes['currentIndex'] + 1;
        this.attributes['currentIndex'] = currentIndex;
        getEvents((events) => {
            if (currentIndex >= events.length) {
                this.attributes['currentIndex'] = currentIndex - 1;
                speechOutput = 'That was the last event. Try searching for events again by saying something like, find technology events near san francisco next week.';
                this.emit(":ask",speechOutput);
            } else {
                var index = (events.length - 1 === currentIndex) ? 'last' : 'next';
                speechOutput = 'The ' + index + ' event is called ' + events[currentIndex].name.text + '. Say tell me more to hear more about this event or next to move to another event.';
                this.emit(":ask",speechOutput);
            }        
        });

    },
	"EventDetailsIntent": function () {
		var speechOutput = "";
        var currentIndex = this.attributes['currentIndex'];
        getEvents((events) => {
            var startTime = events[currentIndex].start.local.split('T');
            var day = new Date(startTime[0]).toLocaleString('en-us', {  weekday: 'long' });
            var descriptionSentences = events[currentIndex].description.text.split('.');
            speechOutput = 'The event starts on ' + day + ', <say-as interpret-as="date">' + startTime[0] + '</say-as> at <say-as interpret-as="time">' + startTime[1] + '</say-as>. Here is the beginning of the description of the event:  <emphasis level="reduced">' + descriptionSentences[0] + '.' + descriptionSentences[1] + '.' + descriptionSentences[2] + '.</emphasis><break time="1s"/> Say, attend event to have the event details sent to you or say next to hear about the next event.';
            this.emit(":ask",speechOutput);
        });
    },

    "AttendEventIntent": function () {
        var speechOutput = "";
        var currentIndex = this.attributes['currentIndex'];
        getEvents((events) => {
            var startTime = events[currentIndex].start.local.split('T');
            var day = new Date(startTime[0]).toLocaleString('en-us', {  weekday: 'long' });
            var cardTitle = events[currentIndex].name.text;
            var cardContent = '\nDate: ' + startTime[0] + '\nTime: ' + startTime[1] + '\nGo to www.eventbrite.com and search for "' + events[currentIndex].name.text + '" to register for this event.';

            var imageObj = {
                smallImageUrl: events[currentIndex].logo.url,
                largeImageUrl: events[currentIndex].logo.original.url
            };

            speechOutput = 'OK. I sent you the event details to the Alexa mobile app. You can follow the instructions to go to the eventbrite website to register for the event.';
            this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);
        });
    },
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
//    END of Intent Handlers {} ========================================================================================

// 3. Helper Function  =================================================================================================
function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
	  var updatedIntent= null;
	  // updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code is necessary if using ASK SDK versions prior to 1.0.9 
	  if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady', updatedIntent);
		
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code necessary is using ASK SDK versions prior to 1.0.9
		if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady');
		
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}

function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    var alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    var returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}

function getEvents(callback) {
  const https = require('https');
  var url = 'https://www.eventbriteapi.com/v3/events/search/?q=' + encodeURI(TopicSlot) +'&sort_by=date&location.address=' + encodeURI(LocationSlot) + '&start_date.keyword=' + encodeURI(DateRangeSlot.replace(' ','_')) +'&token=' + config.eventbriteToken;
  var req = https.get(url, res => {
      res.setEncoding('utf8');
      var returnData = "";

      res.on('data', chunk => {
          returnData = returnData + chunk;
      });

      res.on('end', () => {
          var events = JSON.parse(returnData).events;

          callback(events);
      });

  });
  req.end();
}