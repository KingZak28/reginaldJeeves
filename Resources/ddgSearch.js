const randomize = require("../utils/randomize");
const language = require("../Language/en.json");
const { DDG } = require("node-ddg-api");
const ddg = new DDG("reginaldJeeves");

const ddgSearch = query => {
  const response = ddg.instantAnswer(
    query,
    { skip_disambig: "0" },
    (err, response) => {
      let message;
      try {
        const abstract = response.Abstract;
        const text = response.RelatedTopics[0].Text;
        abstract.length > text.length
          ? (message = `My friends at duck duck go tell me that: ${abstract}`)
          : (message = `My associates at duck duck go tell me that: ${text}`);
      } catch (err) {
        console.log(`Error encountered: ${err}`);
        message =
          "My apologies friend, I'm having trouble contacting my associates";
      }
      return message;
    }
  );
  console.log(`Response is ${response}`);
  return response;
};
module.exports = ddgSearch;
