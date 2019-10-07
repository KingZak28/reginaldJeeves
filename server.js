const bodyParser = require("body-parser");
const express = require("express");
const randomize = require("./utils/randomize");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
app.use(bodyParser.json());

const makeRestaurantIntent = (agent, message) => {
  const restaurantIntent = agent => {
    agent.add(message);
  };
  return restaurantIntent;
};

const webhookProcessing = async (req, res) => {
  const agent = new WebhookClient({ req, res });
  let message = "";
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

    const data = yelpResponse.jsonBody.businesses;
    console.log(data);

    const names = data.map(
      entry =>
        `${entry.name} at ${entry.location.address1} rated at ${entry.rating} stars`
    );
    message = `My friends at yelp say that ${randomize(
      names
    )} in ${location} is quite the restaurant indeed. My contacts never let me down, a butler is well connected you know!`;

    console.log(message);
    restaurantIntent = makeRestaurantIntent(agent, message);
  } catch (err) {
    message =
      "I'm having trouble getting ahold of my contacts at this moment in time please try again later.";
    restaurantIntent = makeRestaurantIntent(agent, message);
  }
  let intentMap = new Map();
  intentMap.set("restaurantIntent", restaurantIntent);
  agent.handleRequest(intentMap);
};

app.get("/", async (req, res) => {
  console.info("Server was hit");
  webhookProcessing(req, res);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
