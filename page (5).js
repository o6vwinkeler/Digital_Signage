export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "16px",
      }}
    >
      <h1>Digital Signage Platform</h1>
      <p>Each company gets a unique display URL, e.g. <code>/display/your-company</code></p>
      <div style={{ display: "flex", gap: "12px" }}>
        <a href="/admin/login">
          <button style={btn}>Admin Login</button>
        </a>
        <a href="/admin/signup">
          <button style={btn}>Sign Up</button>
        </a>
      </div>
    </main>
  );
}

const btn = {
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
};
