import './home.css';
import { useState, useRef, useEffect } from 'react';

function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const sendMessage = async (message) => {
        const res = await fetch("http://localhost:5004/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // important: send cookies
          body: JSON.stringify({ prompt: message })
        });

        if (!res.ok) throw new Error("Failed Gemini call");
        return await res.json();
      };
      
      // Add assistant reply
      const data = await sendMessage(input.trim());
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || "No response 🤔" }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "⚠️ Error: Couldn't reach server" }
      ]);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatgpt-container">
      {/* Scrollable chat section */}
      <div className="chatgpt-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatgpt-message ${msg.role}`}>
            <div className="chatgpt-bubble">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input section */}
      <div className="chatgpt-input-bar">
        <textarea
          className="chatgpt-input"
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder="Message ChatGPT..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="chatgpt-send"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Home;
