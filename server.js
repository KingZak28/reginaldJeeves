const bodyParser = require("body-parser");
const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const yelpMessage = require("./Resources/yelpMessage");
app.use(bodyParser.json());

const webhookProcessing = async (req, res, msg = "") => {
  const agent = new WebhookClient({ request: req, response: res });
  let intentMap = new Map();
  console.log(agent.parameters.geocity);

  if (agent.parameters.geocity) {
    const message = await msg;
    const restaurantIntent = agent => {
      console.log(`Here inside restaurant intent: ${message}`);
      agent.add(message);
    };
    intentMap.set("restaurantIntent", restaurantIntent);
  }

  intentMap.set("restaurantIntent", restaurantIntent);
  agent.handleRequest(intentMap);
};

app.post("/", (req, res) => {
  console.info("Server was hit");
  let msg;
  const location =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.geocity;
  if (location) {
    console.log(`City searched for is: ${location}`);
    msg = yelpMessage(location);
  }
  webhookProcessing(req, res, msg);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is alive G and listening on port: ${process.env.PORT}`);
});
