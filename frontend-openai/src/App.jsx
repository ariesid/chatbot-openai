import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

function App() {
  const [isTyping, setIsTyping] = useState(false);
  const [threadID, setThreadID] = useState("");

  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    // How it responds, how it talks, etc.
    setIsTyping(true);
    await sendMessage(newMessages);
  };

  async function sendMessage(chatMessages) {
    try {
      console.log("Start Send Message");

      const apiBackendOpenai = {
        threadID: threadID,
        inputText: chatMessages[chatMessages.length - 1].message,
      };

      await fetch("http://localhost:3001/ask-gpt", {
        method: "POST",
        headers: {
          // Authorization: "Bearer " + API_KEY,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiBackendOpenai),
      })
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          // console.log("chatMessages", chatMessages);
          console.log("Response: ", data);
          setMessages([
            ...chatMessages,
            {
              message: data.outputText,
              sender: "ChatGPT",
            },
          ]);
          setThreadID(data.threadID);
          setIsTyping(false);
        });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "500px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                // console.log(message);
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
