const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });
const assistantID = process.env.ASSISTANT_ID;

app.use(bodyParser.json());
app.use(cors());

app.post("/ask-gpt", async (req, res) => {
  try {
    const { threadID, inputText } = req.body;
    console.log("threadID:", threadID);
    console.log("Input Text:", inputText);

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    let curThreadID = "";

    if (threadID) {
      curThreadID = threadID;
    } else {
      console.log("<<< Create New Thread ID >>>");
      const thread = await openai.beta.threads.create();
      // const newThreadID = thread.id;
      curThreadID = thread.id;
    }
    console.log("curThreadID :", curThreadID);

    // console.log("Start Create Message");
    const threadMessages = await openai.beta.threads.messages.create(
      curThreadID,
      {
        role: "user",
        content: inputText,
      }
    );
    const messageID = threadMessages.id;
    console.log("messageID: ", messageID);

    // console.log("Start Run Process");
    const run = await openai.beta.threads.runs.create(curThreadID, {
      assistant_id: assistantID,
    });
    const runID = run.id;
    let runStatus = run.status;
    console.log("runID: ", runID);
    console.log("runStatus: ", runStatus);

    while (true) {
      const retrieve = await openai.beta.threads.runs.retrieve(
        curThreadID,
        runID
      );
      runStatus = retrieve.status;
      console.log("runStatus: ", runStatus);

      if (runStatus === "completed") {
        break;
      }

      if (
        runStatus === "expired" ||
        runStatus === "failed" ||
        runStatus === "cancelled"
      )
        throw ("Status is ", runStatus);

      await sleep(5000);
    }

    // console.log("Start List Message");
    const listMessages = await openai.beta.threads.messages.list(curThreadID);
    const outputText = listMessages.data[0].content[0].text.value;

    const responseData = {
      threadID: curThreadID,
      outputText: listMessages.data[0].content[0].text.value,
    };
    // console.log("outputText: ", outputText);
    console.log("responseData: ", responseData);

    // res.json({ outputText });
    res.write(JSON.stringify(responseData));
    res.end();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json(error);
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);
