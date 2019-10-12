const { YELP_KEY } = process.env;
const yelp = require("yelp-fusion");
const client = yelp.client(YELP_KEY);
const language = require("../Language/en.json");

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
    )} in ${location} ${randomize(language.responseRandomizer)} ${randomize(
      language.responseSuffixes
    )}`;
  } catch (err) {
    console.log(`Encountered this error: ${err}`);
    message =
      "I'm having trouble getting ahold of my contacts at this moment in time please try again later.";
  }
  return message;
};

module.exports = yelpMessage;
