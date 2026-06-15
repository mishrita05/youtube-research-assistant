import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fa",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: "860px",
    margin: "auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: "0 0 6px 0",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "17px",
    color: "#666",
    margin: 0,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "10px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  urlRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
    background: "#fafafa",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0 6px",
    lineHeight: 1,
  },
  addBtn: {
    background: "none",
    border: "1px dashed #bbb",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    color: "#666",
    cursor: "pointer",
    marginTop: "4px",
  },
  generateBtn: {
    width: "100%",
    padding: "14px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "8px",
  },
  generateBtnDisabled: {
    width: "100%",
    padding: "14px",
    background: "#a5a3e8",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  loadingBox: {
    background: "#ffffff",
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    padding: "40px 24px",
    textAlign: "center",
    marginBottom: "20px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f0f0f0",
    borderTop: "3px solid #4f46e5",
    borderRadius: "50%",
    margin: "0 auto 16px auto",
    animation: "spin 0.9s linear infinite",
  },
  loadingText: {
    color: "#555",
    fontSize: "15px",
    fontWeight: "500",
    margin: "0 0 6px 0",
  },
  loadingSubText: {
    color: "#999",
    fontSize: "13px",
    margin: 0,
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 16px 0",
  },
  questionItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.5",
  },
  questionNum: {
    background: "#ede9fe",
    color: "#4f46e5",
    borderRadius: "6px",
    padding: "1px 8px",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
    marginTop: "2px",
  },
  reportContent: {
    fontSize: "17px",
    lineHeight: "2",
    color: "#333",
  },
  errorBox: {
    background: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "16px 20px",
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "20px",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  chip: {
    background: "#ede9fe",
    color: "#4f46e5",
    border: "none",
    borderRadius: "20px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
  downloadBtn: {
  background: "#fff",
  border: "1px solid #4f46e5",
  color: "#4f46e5",
  borderRadius: "8px",
  padding: "8px 16px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  },
  videoGrid: {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
  },
  videoCard: {
    display: "flex",
    flexDirection: "column",
    width: "200px",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
  },
  videoThumb: {
    width: "100%",
    height: "112px",
    objectFit: "cover",
    display: "block",
  },
  videoInfo: {
    padding: "10px",
  },
  videoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: "0 0 4px 0",
    lineHeight: "1.4",
  },
  videoMeta: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
  badges: {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "15px",
  },

  badge: {
    background: "#ede9fe",
    color: "#4f46e5",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

// Spinner keyframes injected once
const spinnerStyle = document.createElement("style");
spinnerStyle.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  input:focus { border-color: #4f46e5 !important; background: #fff !important; }
`;
document.head.appendChild(spinnerStyle);

function App() {
  const [urls, setUrls] = useState([""]);
  const [question, setQuestion] = useState("");
  const [researchQuestions, setResearchQuestions] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourcesUsed, setSourcesUsed] = useState(0);
  const [videosUsed, setVideosUsed] = useState(0);
  const [videosInfo, setVideosInfo] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [error, setError] = useState("");

  const addUrl = () => {
    if (urls.length < 5) setUrls([...urls, ""]);
  };

  const removeUrl = (index) => {
    if (urls.length === 1) return;
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const validUrls = urls.filter((u) => u.trim() !== "");
  const canSubmit = validUrls.length > 0 && question.trim() !== "" && !loading;

  const askAI = async () => {
    try {
      setLoading(true);
      setReport("");
      setResearchQuestions([]);
      setError("");

      const response = await axios.post("https://youtube-research-backend-hvt6.onrender.com/ask", {
        urls: validUrls,
        question: question,
      });

      if (response.data.error) {
        setError(response.data.error);
        setReport("");
        setResearchQuestions([]);
        return;
      }

      setResearchQuestions(
        response.data.research_questions || []
      );

      setReport(
        response.data.report || ""
      );
      setSourcesUsed(
      response.data.sources_used || 0
      );

      setVideosUsed(
        response.data.videos_used || 0
      );
      setVideosInfo(response.data.videos || []);
    } catch (err) {
      setError("Could not connect to backend. Make sure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (customQuestion) => {
    const q = (customQuestion ?? chatQuestion).trim();
    if (!q) return;

    try {
      setChatLoading(true);
      setChatAnswer("");
      setChatQuestion(q);

      const response = await axios.post("https://youtube-research-backend-hvt6.onrender.com/chat", {
        question: q,
      });

      setChatAnswer(response.data.answer);
    } catch (err) {
      setError("Could not get answer from chat API.");
    } finally {
      setChatLoading(false);
    }
  };

  const downloadReport = () => {
  const blob = new Blob([report], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "research_report.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  };
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            🎓 YouTube Research Assistant
          </h1>

          <p style={styles.subtitle}>
            Transform YouTube videos into structured research reports using AI, semantic search, and RAG.
          </p>

          <div style={styles.badges}>
            <span style={styles.badge}>📺 Multi-Video</span>
            <span style={styles.badge}>🧠 AI Reports</span>
            <span style={styles.badge}>📌 Citations</span>
            <span style={styles.badge}>🔍 Semantic Search</span>
          </div>
        </div>

        {/* URL Input Card */}
        <div style={styles.card}>
          <span style={styles.label}>YouTube URLs ({urls.length}/5)</span>
          {urls.map((url, index) => (
            <div key={index} style={styles.urlRow}>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                style={styles.input}
              />
              {urls.length > 1 && (
                <button onClick={() => removeUrl(index)} style={styles.removeBtn}>
                  ×
                </button>
              )}
            </div>
          ))}
          {urls.length < 5 && (
            <button onClick={addUrl} style={styles.addBtn}>
              + Add another video
            </button>
          )}
        </div>

        {/* Question Input Card */}
        <div style={styles.card}>
          <span style={styles.label}>Research topic</span>
          <input
            type="text"
            placeholder="e.g. What are the two files that make up an LLM?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && askAI()}
            style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
          />
          <button
            onClick={askAI}
            disabled={!canSubmit}
            style={canSubmit ? styles.generateBtn : styles.generateBtnDisabled}
          >
            {loading ? "Analyzing..." : "Generate Research Report"}
          </button>
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>⚠ {error}</div>}

        {/* Loading */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Analyzing video content...</p>
            <p style={styles.loadingSubText}>
              Extracting transcript → building embeddings → retrieving context → generating report
            </p>
          </div>
        )}

        {/* Sources Analyzed */}
        {videosInfo.length > 0 && !loading && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Sources Analyzed
            </h2>

            <div style={styles.videoGrid}>
              {videosInfo.map((v) => (
                <div
                  key={v.video_id}
                  style={styles.videoCard}
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`}
                    alt={v.title}
                    style={styles.videoThumb}
                  />

                  <div style={styles.videoInfo}>
                    <p style={styles.videoTitle}>
                      {v.title}
                    </p>

                    <p style={styles.videoMeta}>
                      {v.chunks_used} chunks used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Questions */}
        {researchQuestions.length > 0 && !loading && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Research Questions Generated</h2>
            {researchQuestions.map((q, i) => (
              <div key={i} style={styles.questionItem}>
                <span style={styles.questionNum}>{i + 1}</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        )}

        {/* Report */}
        {report && !loading && (
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={styles.sectionTitle}>Research Report</h2>
                <button onClick={downloadReport} style={styles.downloadBtn}>
                  ⬇ Download Report
                </button>
              </div>
            <p
              style={{
                color: "#666",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              📊 Sources Used: {sourcesUsed} chunks from {videosUsed} videos
            </p>

            <div style={styles.reportContent}>
              <ReactMarkdown
                components={{
                  h1: ({children}) => (
                    <h1 style={{
                      fontSize: "32px",
                      marginTop: "30px",
                      marginBottom: "20px",
                      color: "#1a1a2e"
                    }}>
                      {children}
                    </h1>
                  ),

                  p: ({children}) => (
                    <p style={{
                      fontSize: "16px",
                      lineHeight: "1.9",
                      marginBottom: "18px"
                    }}>
                      {children}
                    </p>
                  ),
                }}
              >
                {report}
              </ReactMarkdown>
            </div>

            <hr style={{ margin: "20px 0" }} />

            <h3>Explore This Topic Further</h3>
            <p style={{ color: "#999", fontSize: "13px", marginTop: 0, marginBottom: "14px" }}>
              Tap a question, or ask your own
            </p>

            <div style={styles.chipContainer}>
              {researchQuestions.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  style={styles.chip}
                  onClick={() => askQuestion(q)}
                  disabled={chatLoading}
                >
                  {q.length > 70 ? q.slice(0, 70) + "..." : q}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or type your own question..."
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              style={{
                ...styles.input,
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "10px",
              }}
            />

            <button
              onClick={() => askQuestion()}
              disabled={chatLoading}
              style={chatLoading ? styles.generateBtnDisabled : styles.generateBtn}
            >
              {chatLoading ? "Thinking..." : "Get Answer"}
            </button>

            {chatAnswer && !chatLoading && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#fafafa",
                  borderRadius: "10px",
                }}
              >
                <h3>Answer</h3>

                <ReactMarkdown >
                  {chatAnswer}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;