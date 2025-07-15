import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setOutline(null);

    try {
      const response = await generateOutline(topic);
      setOutline(response);
    } catch (err) {
      setError('Failed to generate outline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async (topic: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openchat/openchat-3.5',
        messages: [
          {
            role: 'user',
            content: `Generate a detailed blog outline on the topic: "${topic}". The outline should include:
- An introduction
- At least 5 main sections, each with 3 sub-points
- A conclusion with key takeaways and a call to action.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error('OpenRouter API request failed');
    }

    const data = await res.json();
    return data.choices[0].message.content.trim();
  };

  return (
    <div className="app">
      <h1>Blog Outline Generator</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter blog topic"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Outline'}
      </button>

      {error && <p className="error">{error}</p>}

      {outline && (
        <pre className="outline">{outline}</pre>
      )}
    </div>
  );
};

export default App;
