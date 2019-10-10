const bodyParser = require("body-parser");
const express = require("express");
const randomize = require("./utils/randomize");
const { WebhookClient, Card } = require("dialogflow-fulfillment");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
const language = require("./en.json");
app.use(bodyParser.json());

const yelpMessage = async req => {
  let message = "test";
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

    const names = data.map(
      entry =>
        `${entry.name} at ${entry.location.address1} rated at ${entry.rating} stars`
    );
    message = `${randomize(language.restaurantPrefixes)} ${randomize(
      names
    )} in ${location} is quite the restaurant indeed. ${randomize(
      language.responseSuffixes
    )}`;
  } catch (err) {
    console.log(`Encountered this error: ${err}`);
    message =
      "I'm having trouble getting ahold of my contacts at this moment in time please try again later.";
  }
  return message;
};

const webhookProcessing = async (req, res, msg) => {
  const agent = new WebhookClient({ request: req, response: res });
  const message = await msg;
  const restaurantIntent = agent => {
    console.log(`Here inside restaurant intent: ${message}`);
    agent.add(message);
  };

  let intentMap = new Map();
  intentMap.set("restaurantIntent", restaurantIntent);
  agent.handleRequest(intentMap);
};

app.post("/", (req, res) => {
  console.info("Server was hit");
  const msg = yelpMessage(req);
  webhookProcessing(req, res, msg);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
