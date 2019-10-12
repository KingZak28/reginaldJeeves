const bodyParser = require("body-parser");
const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const yelpMessage = require("./Resources/yelpMessage");
const ddgSearch = require("./Resources/ddgSearch");
app.use(bodyParser.json());

const webhookProcessing = async (req, res, msg = "") => {
  const agent = new WebhookClient({ request: req, response: res });
  let intentMap = new Map();

  if (agent.parameters.geocity) {
    const message = await msg;
    const restaurantIntent = agent => {
      console.log(`Here inside restaurant intent: ${message}`);
      agent.add(message);
    };
    intentMap.set("restaurantIntent", restaurantIntent);
  } else if (agent.parameters.any) {
    const searchIntent = agent => {
      console.log(`Here inside search intent: ${msg}`);
      agent.add(msg);
    };
    intentMap.set("searchIntent", searchIntent);
  }

  agent.handleRequest(intentMap);
};

app.post("/", (req, res) => {
  console.info(
    `Server was hit with paramters: ${req.body.queryResult.parameters.any}`
  );
  console.log(req.body);
  let msg;

  const location =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.geocity;

  const query =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.any;

  if (location) {
    console.log(`City searched for is: ${location}`);
    msg = yelpMessage(location);
  } else if (query) {
    console.log(`Query to search for is: ${query}`);
    msg = ddgSearch(query);
  }
  webhookProcessing(req, res, msg);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
