const bodyParser = require("body-parser");
const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const yelpMessage = require("./Resources/yelpMessage");
app.use(bodyParser.json());

const webhookProcessing = async (req, res, msg) => {
  const agent = new WebhookClient({ request: req, response: res });
  console.log(agent.parameters);
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
