"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => (window.location.href = "/admin/login"), 2000);
    }
    setLoading(false);
  }

  return (
    <main style={wrap}>
      <h1>Set a New Password</h1>
      <form onSubmit={handleUpdate} style={form}>
        <input
          style={input}
          type="password"
          placeholder="New password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button style={btn} type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}

const wrap = { maxWidth: 400, margin: "60px auto", padding: 20 };
const form = { display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: 10, fontSize: 16 };
const btn = { padding: 10, fontSize: 16, cursor: "pointer" };
