"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function SignUp() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const baseSlug = slugify(companyName) || "company";
      let slug = baseSlug;
      let attempt = 0;

      // Ensure the slug is unique by appending a number if needed
      while (attempt < 5) {
        const { data: existing } = await supabase
          .from("clients")
          .select("slug")
          .eq("slug", slug)
          .maybeSingle();
        if (!existing) break;
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      await supabase.from("clients").insert({
        id: userId,
        slug,
        company_name: companyName,
      });
    }

    setMessage(
      "Account created! Check your email to confirm your address, then log in."
    );
    setLoading(false);
  }

  return (
    <main style={wrap}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp} style={form}>
        <input
          style={input}
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button style={btn} type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      {message && <p>{message}</p>}
      <a href="/admin/login">Already have an account? Log in</a>
    </main>
  );
}

const wrap = { maxWidth: 400, margin: "60px auto", padding: 20 };
const form = { display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: 10, fontSize: 16 };
const btn = { padding: 10, fontSize: 16, cursor: "pointer" };
