const Twitter = require("twitter");
const AWS = require("aws-sdk")


AWS.config.region = "us-east-1"

//If necessary, add access and secret key
//NOT RECOMMENDED FOR PRODUCTION ENVIROMENTS
// AWS.config.accessKeyId = ""
// AWS.config.secretAccessKey = ""

var kinesis = new AWS.Kinesis();


var client = new Twitter({
	consumer_key: "XXXXXXXXX",
	consumer_secret: "XXXXXXX",
	access_token_key: "XXXXXXX",
	access_token_secret: "XXXXXXX",
})

var stream = client.stream('statuses/filter', {
    track: 'bolsonaro',
    language: 'pt'
});

stream.on('data', function (event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            tweet: event.text.replace(/["'}{|]/g, '') //either strip out problem characters or base64 encode for safety
        }) + '|'; // record delimiter

        kinesis.putRecord({
            Data: record,
            StreamName: 'twitterStream',
            PartitionKey: 'key'
        }, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log('sending: ', event.text);
        });
    }
});

stream.on('error', function (error) {
    throw error;
});