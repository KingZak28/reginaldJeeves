const bodyParser = require("body-parser");
const express = require("express");
const randomize = require("./utils/randomize");
const app = express();
const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
app.use(bodyParser.json());

app.get("/getRestaurants", async (req, res) => {
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
    const message = `My friends at yelp say that ${randomize(
      names
    )} in ${location} is quite the restaurant indeed. My contacts never let me down, a butler is well connected you know!`;
    const response = {
      google: {
        expectUserResponse: true,
        richResponse: {
          items: [
            {
              simpleResponse: {
                textToSpeech: message
              }
            }
          ]
        }
      }
    };
    console.log(message);

    res.json({
      payload: response,
      fulfillmentText: message,
      speech: message,
      displayText: message,
      source: "webhook"
    });
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
