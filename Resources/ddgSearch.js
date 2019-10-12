const randomize = require("../utils/randomize");
const language = require("../Language/en.json");
const { duckIt } = require("node-duckduckgo");

const ddgSearch = async query => {
  try {
    const result = await duckIt(query);
    const abstract = result.data.AbstractText;
    const text = result.data.RelatedTopics[0].Text;
    abstract.length > text.length
      ? (message = `My friends at duck duck go tell me that: ${abstract}`)
      : (message = `My associates at duck duck go tell me that: ${text}`);
    return message;
  } catch (err) {
    console.error("Error Encountered: ", err);
    message =
      "Apologies friend, I'm having trouble searching for that right now";
    return message;
  }
};

module.exports = ddgSearch;
