"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/admin/login";
        return;
      }

      setUserId(user.id);

      const { data: clientRow } = await supabase
        .from("clients")
        .select("*")
        .eq("id", user.id)
        .single();

      if (clientRow) {
        setClient(clientRow);
        setCompanyName(clientRow.company_name || "");
        setZipCode(clientRow.zip_code || "");
        setFavoriteTeam(clientRow.favorite_team || "");
      }

      const { data: media } = await supabase
        .from("media_items")
        .select("*")
        .eq("client_id", user.id)
        .order("sort_order", { ascending: true });

      setMediaItems(media || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveDetails(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("clients")
      .update({
        company_name: companyName,
        zip_code: zipCode,
        favorite_team: favoriteTeam,
      })
      .eq("id", userId);

    setMessage(error ? error.message : "Saved!");
    setSaving(false);
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const path = `${userId}/logo-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("signage-media")
      .upload(path, file);

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("signage-media")
      .getPublicUrl(path);

    await supabase
      .from("clients")
      .update({ logo_url: publicUrlData.publicUrl })
      .eq("id", userId);

    setClient({ ...client, logo_url: publicUrlData.publicUrl });
    setMessage("Logo uploaded!");
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const path = `${userId}/media-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("signage-media")
      .upload(path, file);

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("signage-media")
      .getPublicUrl(path);

    const { data: inserted, error: insertError } = await supabase
      .from("media_items")
      .insert({
        client_id: userId,
        file_url: publicUrlData.publicUrl,
        file_type: isVideo ? "video" : "image",
        sort_order: mediaItems.length,
      })
      .select()
      .single();

    if (insertError) {
      setMessage(insertError.message);
      return;
    }

    setMediaItems([...mediaItems, inserted]);
    setMessage("Media uploaded!");
  }

  async function handleDeleteMedia(id) {
    await supabase.from("media_items").delete().eq("id", id);
    setMediaItems(mediaItems.filter((m) => m.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  const displayUrl = client
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/display/${client.slug}`
    : "";

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={btn}>
          Log Out
        </button>
      </div>

      {client && (
        <p>
          Your live display URL:{" "}
          <a href={displayUrl} target="_blank" rel="noreferrer">
            {displayUrl}
          </a>
        </p>
      )}

      <section style={section}>
        <h2>Company Details</h2>
        <form onSubmit={handleSaveDetails} style={form}>
          <label>Company Name</label>
          <input
            style={input}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <label>Zip Code (for weather)</label>
          <input
            style={input}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 94103"
          />
          <label>Favorite Team (for sports scores)</label>
          <input
            style={input}
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            placeholder="e.g. Golden State Warriors"
          />
          <button style={btn} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Details"}
          </button>
        </form>
      </section>

      <section style={section}>
        <h2>Logo</h2>
        {client?.logo_url && (
          <img src={client.logo_url} alt="Logo" style={{ maxWidth: 150, display: "block", marginBottom: 10 }} />
        )}
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
      </section>

      <section style={section}>
        <h2>Stills & Videos (Main Display Panel)</h2>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {mediaItems.map((item) => (
            <div key={item.id} style={mediaCard}>
              {item.file_type === "video" ? (
                <video src={item.file_url} width={120} muted />
              ) : (
                <img src={item.file_url} alt="" width={120} />
              )}
              <button onClick={() => handleDeleteMedia(item.id)} style={btn}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      {message && <p>{message}</p>}
    </main>
  );
}

const section = { marginTop: 30, borderTop: "1px solid #ddd", paddingTop: 20 };
const form = { display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 };
const input = { padding: 8, fontSize: 15 };
const btn = { padding: "8px 14px", fontSize: 14, cursor: "pointer" };
const mediaCard = { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 };
