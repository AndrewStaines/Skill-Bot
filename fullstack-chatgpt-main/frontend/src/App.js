import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Spinner from './component/Spinner';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const msg = new SpeechSynthesisUtterance();
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setUserInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const sendMessage = async () => {
    const dm = document.getElementById('dm');
    dm.style.display = 'none';
    setIsLoading(true);

    try {
      const userMessage = { id: messages.length + 1, role: 'user', content: userInput };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const prompt = userInput;
      setUserInput('');

      const response = await axios.post('http://localhost:5000/message', { prompt: prompt });
      const assistantMessage = { id: messages.length + 2, role: 'assistant', content: response.data.assistant_message };
      msg.text = response.data.assistant_message;
      window.speechSynthesis.speak(msg);
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="App">
      <div className="App-header">
        <h1>ADBot</h1>
        <div className="message-container">
          <h1 id="dm">How Can I Help You Today!!!</h1>
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {isLoading && <Spinner />}
        <div className="input-container">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Message ADBot..."
            readOnly
          />
          <button onClick={toggleListening}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button onClick={sendMessage} disabled={!userInput.trim()}>Stop Listening</button>
        </div>
      </div>
      <div className='copy-right'>
        <p>@Copyrights owned by KEC students</p>
        <p>@Made with the Google API</p>
      </div>
    </div>
  );
}

export default App;