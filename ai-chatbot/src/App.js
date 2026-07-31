import React, { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        user: userMessage,
        bot: "Thinking...",
      },
    ]);

    setMessage("");

    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: userMessage,
      }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        user: userMessage,
        bot: data.answer,
      },
    ]);
  };

  return (
  <div className="container">

    <div className="header">
      <h1> Knowledge AI</h1>
      <p>AI-powered Knowledge Assistant</p>
    </div>

    <div className="chat-box">
      {messages.length === 0 && (
        <div className="welcome">
          👋 Hello! Ask me anything from the loaded knowledge base.
        </div>
      )}

      {messages.map((msg, index) => (
        <div key={index}>

          <div className="user-message">
            <strong>You</strong>
            <p>{msg.user}</p>
          </div>

          <div className="bot-message">
            <strong>Knowledge AI</strong>
            <p>{msg.bot}</p>
          </div>

        </div>
      ))}
    </div>

    <div className="input-area">

      <input
        type="text"
        value={message}
        placeholder="Ask your question..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button onClick={sendMessage}>
         ➤
      </button>

    </div>

  </div>
);
}

export default App;