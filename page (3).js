"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <main style={wrap}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} style={form}>
        <input
          style={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={btn} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      {message && <p>{message}</p>}
      <a href="/admin/reset-password">Forgot password?</a>
      <br />
      <a href="/admin/signup">Need an account? Sign up</a>
    </main>
  );
}

const wrap = { maxWidth: 400, margin: "60px auto", padding: 20 };
const form = { display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: 10, fontSize: 16 };
const btn = { padding: 10, fontSize: 16, cursor: "pointer" };
