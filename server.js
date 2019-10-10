const bodyParser = require("body-parser");
const express = require("express");
const randomize = require("./utils/randomize");
const { WebhookClient, Card } = require("dialogflow-fulfillment");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
app.use(bodyParser.json());

const yelpMessage = async req => {
  let message = "test";
  let results = [];
  try {
    const location =
      req.body.queryResult &&
      req.body.queryResult.parameters &&
      req.body.queryResult.parameters.geocity
        ? req.body.queryResult.parameters.geocity
        : "Liverpool england"; //Default city for now
    const yelpResponse = await client.search({
      location: location
    });

    console.log(yelpResponse.jsonBody);
    const data = yelpResponse.jsonBody.businesses;

    const totalResults = data.map(entry => [
      entry.name,
      `My friends at yelp say that ${entry.name} at ${entry.location.address1} rated at ${entry.rating} stars in ${location} is quite the restaurant indeed. My contacts never let me down, a butler is well connected you know!`,
      entry.image_url,
      entry.url
    ]);
    result.push(randomize(totalResults));
  } catch (err) {
    console.log(`Encountered this error: ${err}`);
    message =
      "I'm having trouble getting ahold of my contacts at this moment in time please try again later.";
    result.push(message);
  }
  return result;
};

const webhookProcessing = async (req, res, restaurantResult) => {
  const agent = new WebhookClient({ request: req, response: res });
  const results = await restaurantResult;
  const restaurantIntent = agent => {
    console.log(`Here inside restaurant intent: ${results}`);
    if (results.length > 1) {
      agent.add(results[1]);
      agent.add(
        new Card({
          title: results[0],
          image_url: results[2],
          text: results[1],
          buttonText: "See more reviews!",
          buttonUrl: results[3]
        })
      );
    } else {
      agent.add(results[0]);
    }
  };

  let intentMap = new Map();
  intentMap.set("restaurantIntent", restaurantIntent);
  agent.handleRequest(intentMap);
};

app.post("/", (req, res) => {
  console.info("Server was hit");
  const restaurantResult = yelpMessage(req);
  webhookProcessing(req, res, restaurantResult);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
