import { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [story, setStory] = useState(
    "Add your story here.\n\nUnderline any part you want feedback on before clicking Revise."
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(story);

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const storyRef = useRef(null);


  function startEdit() {
    setDraft(story);
    setIsEditing(true);
  }

  function saveEdit() {
    setStory(draft);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

 
  function underlineSelection() {
    document.execCommand("underline");
  }


  async function getFeedback(text) {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `Give constructive feedback on how to improve this writing.
Do NOT rewrite it.

Text:
${text}`,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  }

  async function reviseStory() {
    const underlined = storyRef.current.querySelectorAll("u");

    if (underlined.length === 0) {
      alert("Please underline text before clicking Revise.");
      return;
    }

    let textToRevise = "";
    underlined.forEach((u) => {
      textToRevise += u.innerText + "\n";
    });

    setLoading(true);
    setFeedback("");

    try {
      const result = await getFeedback(textToRevise);
      setFeedback(result);
    } catch (error) {
      console.error(error);
      setFeedback("Error getting feedback.");
    }

    setLoading(false);
  }

  return (
    <div className="container">
      <h1>AI Story Generator</h1>

      <div className="story-box">
        {isEditing ? (
          <textarea
            className="editor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <div
            ref={storyRef}
            className="story editable"
            contentEditable
            suppressContentEditableWarning
          >
            {story}
          </div>
        )}
      </div>

      <div className="buttons">
        {!isEditing ? (
          <>
            <button onClick={startEdit}>Edit</button>
            <button onClick={underlineSelection}>Underline</button>
            <button className="secondary" onClick={reviseStory}>
              Revise
            </button>
          </>
        ) : (
          <>
            <button onClick={saveEdit}>Save</button>
            <button className="secondary" onClick={cancelEdit}>
              Cancel
            </button>
          </>
        )}
      </div>

      {loading && <p className="loading">Analyzing selected text…</p>}

      {feedback && (
        <div className="feedback">
          <h3>Revision Feedback</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
}
