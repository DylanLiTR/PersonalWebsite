import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./chatbot.css";
import { usePhaser } from "./PhaserContext";

const WIDTH = 480;

const Chatbot = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: window.innerWidth * 0.5 - WIDTH / 2, y: window.innerHeight - 140 });
  const [isTyping, setIsTyping] = useState(false);
  const [messagesHeight, setMessagesHeight] = useState(160);
  const chatRef = useRef(null);
  const headerRef = useRef(null);
  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { sendResponse, drawEllipsis } = usePhaser();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    if (messagesRef.current) {
      if (!collapsed) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - chatRef.current.clientWidth, chatRef.current.getBoundingClientRect().left)),
          y: Math.max(0, Math.min(window.innerHeight - chatRef.current.clientHeight + messagesRef.current.clientHeight, chatRef.current.getBoundingClientRect().top + messagesHeight - messagesRef.current.clientHeight)),
        });
        setMessagesHeight(messagesRef.current.clientHeight);
      }
    }
  }, [messages]);

  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const sanitizedInput = input.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const userMessage = { 
      role: "user", 
      content: sanitizedInput,
      time: formatTime()
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);
    drawEllipsis();
    
    try {
      // Simulate response delay for typing effect
      setTimeout(async () => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/npc/chat`, {
            messages: [...messages, { role: "user", content: sanitizedInput }]
          });
          
          const botMessage = {
            ...response.data.choices[0].message,
            time: formatTime()
          };
          sendResponse(response.data.choices[0].message.content);
          
          setMessages(prevMessages => [...prevMessages, botMessage]);
          setIsTyping(false);
        } catch (error) {
          console.error("Error:", error);

          let errorResponse = {
            role: "assistant",
            content: "Sorry, I'm having trouble connecting right now.",
            time: formatTime()
          };

          // Check for rate limit error (429 status code)
          if (error.response && error.response.status === 429) {
            const cooldown = error.response.data.cooldown || 900;
            const rateLimitReset = Math.ceil(cooldown / 60);
            errorResponse = {
              role: "assistant",
              content: `Time flies so fast talking with you! I'll need a quick ${rateLimitReset}min break, but let's talk again soon!`,
              time: formatTime()
            };
          }
          sendResponse(errorResponse.content);
          setMessages(prevMessages => [...prevMessages, errorResponse]);
          setIsTyping(false);
        }
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
      
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  // Dragging logic
  const handleMouseDown = (e) => {
    if (!e.target.closest('.chatbot-header')) return;
    
    e.preventDefault();
    const chatWindow = chatRef.current;
    const offsetX = e.clientX - chatWindow.getBoundingClientRect().left;
    const offsetY = e.clientY - chatWindow.getBoundingClientRect().top;
    
    const handleMouseMove = (e) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - chatWindow.clientWidth, e.clientX - offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - chatWindow.clientHeight, e.clientY - offsetY)),
      });
    };
    
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleCollapse = (newCollapsed) => {
    setCollapsed(newCollapsed);
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - chatRef.current.clientWidth, chatRef.current.getBoundingClientRect().left)),
      y: Math.max(0, Math.min(window.innerHeight - chatRef.current.clientHeight + messagesHeight, chatRef.current.getBoundingClientRect().top + messagesHeight * (newCollapsed ? 1 : -1))),
    });
  };

  return (
    <div
      className="chat-overlay"
      ref={chatRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="chatbot-header" ref={headerRef}>
        <div className="bot-header">
          <h2>Dylan</h2>
        </div>
        <button 
          className="chat-collapse-button" 
          onClick={() => handleCollapse(!collapsed)}
        >
          {collapsed ? "▲" : "▼"}
        </button>
      </div>
      
      {(
        <div className="chat-messages" ref={messagesRef} style={{ display: collapsed ? "none" : "block" }}>
          {messages.length === 0 && (
            <div className="bot-msg">
              Hi, my name is Dylan and welcome to my website! Feel free to look around and ask me any questions.
              <div className="message-time">Dylan</div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "user-msg" : "bot-msg"}>
              {msg.content}
              <div className="message-time">{msg.time}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="bot-msg typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
          maxLength={200}
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;