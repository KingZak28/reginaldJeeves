const bodyParser = require("body-parser");
const express = require("express");
const randomize = require("./utils/randomize");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const makeRestaurantIntent = (agent, message) => {
  const restaurantIntent = agent => {
    agent.add(message);
  };
  return restaurantIntent;
};

const yelpMessage = (req, agent) => {
  let message = "";
  const location =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.geocity
      ? req.body.queryResult.parameters.geocity
      : "Liverpool england"; //Default city for now
  client
    .search({
      location: location
    })
    .then(response => {
      const data = response.jsonBody.businesses;
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
      return restaurantIntent;
    })
    .catch(e => {
      console.log(`Error encountered: ${e}`);
      message =
        "I'm having trouble getting ahold of my contacts at this moment in time please try again later.";
      restaurantIntent = makeRestaurantIntent(agent, message);
      return restaurantIntent;
    });
};

const webhookProcessing = (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const restaurantIntent = yelpMessage(req, agent);
  let intentMap = new Map();
  intentMap.set("restaurantIntent", restaurantIntent);
  agent.handleRequest(intentMap);
};

app.post("/", (req, res) => {
  console.log("Server was hit");
  console.log(req);
  webhookProcessing(req, res);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
