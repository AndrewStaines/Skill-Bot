import React from 'react';
import ReactMarkdown from 'react-markdown';

// CodeRenderer component to render code snippets with Markdown support
function CodeRenderer({ text }) {
  return (
    <div className="code-container">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export default CodeRenderer;
