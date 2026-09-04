"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/admin/update-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }
    setLoading(false);
  }

  return (
    <main style={wrap}>
      <h1>Reset Password</h1>
      <form onSubmit={handleReset} style={form}>
        <input
          style={input}
          type="email"
          placeholder="Your account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button style={btn} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p>{message}</p>}
      <a href="/admin/login">Back to login</a>
    </main>
  );
}

const wrap = { maxWidth: 400, margin: "60px auto", padding: 20 };
const form = { display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: 10, fontSize: 16 };
const btn = { padding: 10, fontSize: 16, cursor: "pointer" };
