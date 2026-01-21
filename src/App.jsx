import { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [story, setStory] = useState(
    "Add your story here. Underline any part you want feedback on."
  );
  const [draft, setDraft] = useState(story);
  const [isEditing, setIsEditing] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [rewrites, setRewrites] = useState([]);
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
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const underline = document.createElement("u");
    range.surroundContents(underline);
    selection.removeAllRanges();
  }

  async function reviseStory() {
    const underlined = storyRef.current?.querySelectorAll("u");
    if (underlined== null || underlined.length === 0) {
      alert("Please underline text before clicking Revise.");
      return;
    }

    let textToRevise = "";

    for (const u of underlined) {
      textToRevise += u.innerText + "\n";
    }
    
    textToRevise = textToRevise.trim();
    

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          stream: false,
          prompt: `
You are a writing coach.

For the following text:
"${textToRevise}"

1. Give brief feedback on grammar and clarity.
2. Suggest what could be added or improved.
3. Provide EXACTLY 3 rewritten versions of the text.

Format your response exactly like this:

FEEDBACK:
- ...

REWRITE 1:
...

REWRITE 2:
...

REWRITE 3:
...
          `,
        }),
      });

      const data = await response.json();
      const text = data.response || "";

      const parts = text.split(/REWRITE \d:/);
      setFeedback(parts[0].replace("FEEDBACK:", "").trim());
      setRewrites(parts.slice(1).map((r) => r.trim()));
    } catch (err) {
      setFeedback("Error getting feedback.");
    }

    setLoading(false);
  }

  function applyRewrite(rewrite) {
    setStory(rewrite);
    setRewrites([]);
    setFeedback("");
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
          <h3>Feedback</h3>
          <p>{feedback}</p>
        </div>
      )}

      {rewrites.length > 0 && (
        <div className="rewrites">
          <h3>Choose a Rewrite</h3>
          {rewrites.map((r, i) => (
            <button
              key={i}
              className="rewrite-option"
              onClick={() => applyRewrite(r)}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
