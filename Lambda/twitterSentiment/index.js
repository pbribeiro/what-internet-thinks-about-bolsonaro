const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const comprehend = new AWS.Comprehend();

exports.handler = (event, context, callback) => {

  event.Records.forEach(function(record) {
	console.log()
    if (record.eventName == 'INSERT') { // Only run for Insert events

      //Twitter text is get from "tweet" column from dynamoDB
      let comprehendParams = {
        LanguageCode: 'pt',
        Text: record.dynamodb.NewImage.tweet.S
      };

      comprehend.detectSentiment(comprehendParams, function(err, data) {
        if (err) callback(err);
        else {

          //DynamoDB_TABLE is a enviroment variable configures on the AWS Lambda
          let dynParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              "sentiment": data.Sentiment
            },
            UpdateExpression: "ADD tweets :val",
            ConditionExpression: "attribute_not_exists(sentiment) OR sentiment = :sentiment",
            ExpressionAttributeValues: {
              ":val": 1,
              ":sentiment": data.Sentiment
            },
            ReturnValues: "UPDATED_NEW"
          };

          docClient.update(dynParams, function(err, data) {
            if (err) {
              callback(err); // something strange happened
            }
            else {
              callback(null, data);
            }
          });
        }
      });
    }
  });
};
