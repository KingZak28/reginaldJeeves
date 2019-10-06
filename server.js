const axios = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
app.use(bodyParser.json());

app.get("/getRestaurants", async (req, res) => {
  try {
    const yelpResponse = await client.search({
      location: "waterloo"
    });

    const data = yelpResponse.jsonBody.businesses;

    const names = data.map(entry => `${entry.name} rated at ${entry.rating}`);
    console.log(names);

    res.json({ code: "Success" });
  } catch (err) {
    console.log("Error Encountered: " + err);
    res.json({
      message:
        "I'm having trouble getting ahold of my contacts at this moment in time please try again later."
    });
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is alive G");
});
