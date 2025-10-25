import React, { useEffect, useState } from "react";
import { checkHealth } from "./api";

function App() {
  const [status, setStatus] = useState("loading...");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    async function run() {
      const result = await checkHealth();
      if (result.ok) {
        setStatus("✅ Backend is reachable");
        setDetails(result.data);
      } else {
        setStatus("❌ Can't reach backend");
        setDetails({ error: result.error });
      }
    }

    run();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        LuTutor Frontend
      </h1>

      <p
        style={{
          fontSize: "1rem",
          color: "#94a3b8",
          marginBottom: "2rem",
        }}
      >
        Frontend ↔ Backend connection test
      </p>

      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "1rem",
          padding: "1.5rem 2rem",
          minWidth: "300px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          textAlign: "left",
          border: "1px solid #334155",
        }}
      >
        <div
          style={{
            fontSize: "1.1rem",
            marginBottom: "0.5rem",
          }}
        >
          Status: <strong>{status}</strong>
        </div>

        <pre
          style={{
            backgroundColor: "#0f172a",
            color: "#38bdf8",
            fontSize: "0.8rem",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #334155",
            overflowX: "auto",
            maxWidth: "400px",
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      </div>

      <footer
        style={{
          marginTop: "2rem",
          fontSize: "0.75rem",
          color: "#475569",
        }}
      >
        built by Laji + team 🚀
      </footer>
    </div>
  );
}

export default App;
