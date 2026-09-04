"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function DisplayPage() {
  const { slug } = useParams();
  const [client, setClient] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [sports, setSports] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Load client + media
  useEffect(() => {
    async function load() {
      const { data: clientRow } = await supabase
        .from("clients")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!clientRow) {
        setNotFound(true);
        return;
      }
      setClient(clientRow);

      const { data: media } = await supabase
        .from("media_items")
        .select("*")
        .eq("client_id", clientRow.id)
        .order("sort_order", { ascending: true });

      setMediaItems(media || []);
    }
    load();
  }, [slug]);

  // Cycle through media every 8 seconds (images); videos play through, then advance
  useEffect(() => {
    if (mediaItems.length === 0) return;
    const current = mediaItems[mediaIndex];
    if (!current || current.file_type === "video") return; // videos advance via onEnded

    const timer = setTimeout(() => {
      setMediaIndex((i) => (i + 1) % mediaItems.length);
    }, 8000);
    return () => clearTimeout(timer);
  }, [mediaIndex, mediaItems]);

  // Fetch weather + sports, refresh every 10 minutes
  useEffect(() => {
    if (!client) return;

    async function fetchData() {
      if (client.zip_code) {
        const res = await fetch(`/api/weather?zip=${client.zip_code}`);
        const data = await res.json();
        if (!data.error) setWeather(data);
      }
      if (client.favorite_team) {
        const res = await fetch(`/api/sports?team=${encodeURIComponent(client.favorite_team)}`);
        const data = await res.json();
        if (!data.error) setSports(data);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client]);

  if (notFound) {
    return <main style={{ padding: 40 }}>No signage found for this URL.</main>;
  }
  if (!client) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  const currentMedia = mediaItems[mediaIndex];

  return (
    <main style={outer}>
      <header style={header}>
        {client.logo_url && <img src={client.logo_url} alt="logo" style={{ height: 50 }} />}
        <h1 style={{ margin: 0 }}>{client.company_name}</h1>
      </header>

      <div style={body}>
        <section style={mainPanel}>
          {currentMedia ? (
            currentMedia.file_type === "video" ? (
              <video
                key={currentMedia.id}
                src={currentMedia.file_url}
                autoPlay
                muted
                onEnded={() => setMediaIndex((i) => (i + 1) % mediaItems.length)}
                style={mediaStyle}
              />
            ) : (
              <img key={currentMedia.id} src={currentMedia.file_url} alt="" style={mediaStyle} />
            )
          ) : (
            <p style={{ color: "#888" }}>No media uploaded yet.</p>
          )}
        </section>

        <aside style={sidePanel}>
          <div style={widget}>
            <h3>Weather</h3>
            {weather ? (
              <>
                <p style={{ fontSize: 32, margin: "4px 0" }}>{weather.tempF}°F</p>
                <p style={{ margin: 0, textTransform: "capitalize" }}>{weather.description}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{weather.city}</p>
              </>
            ) : (
              <p style={{ color: "#888" }}>No zip code set.</p>
            )}
          </div>

          <div style={widget}>
            <h3>Sports</h3>
            {sports ? (
              <>
                <p style={{ fontWeight: "bold", margin: "4px 0", fontSize: 14 }}>{sports.teamName}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={sportsCol}>
                    <p style={sportsLabel}>NEXT</p>
                    {sports.nextEvent ? (
                      <>
                        <p style={sportsLine}>vs {sports.nextEvent.opponent}</p>
                        <p style={sportsSubline}>{sports.nextEvent.date}</p>
                      </>
                    ) : (
                      <p style={sportsSubline}>—</p>
                    )}
                  </div>
                  <div style={sportsCol}>
                    <p style={sportsLabel}>LAST</p>
                    {sports.lastResult ? (
                      <>
                        <p style={sportsLine}>
                          {sports.lastResult.home} {sports.lastResult.homeScore}–
                          {sports.lastResult.awayScore} {sports.lastResult.away}
                        </p>
                        <p style={sportsSubline}>{sports.lastResult.date}</p>
                      </>
                    ) : (
                      <p style={sportsSubline}>—</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: "#888" }}>No team set.</p>
            )}
          </div>

          <div style={widget}>
            <h3>Clock</h3>
            <ClockWidget />
          </div>
        </aside>
      </div>
    </main>
  );
}

function ClockWidget() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <p style={{ fontSize: 22, margin: 0 }}>{time.toLocaleTimeString()}</p>;
}

const outer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "#111",
  color: "#fff",
};
const header = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "12px 24px",
  background: "#000",
};
const body = { flex: 1, display: "flex" };
const mainPanel = {
  flex: 3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000",
};
const mediaStyle = { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" };
const sidePanel = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  background: "#1a1a1a",
};
const widget = {
  background: "#222",
  borderRadius: 8,
  padding: 12,
};
const sportsCol = {
  flex: 1,
  minWidth: 0,
  background: "#181818",
  borderRadius: 6,
  padding: "6px 8px",
};
const sportsLabel = {
  margin: 0,
  fontSize: 10,
  letterSpacing: 1,
  color: "#888",
};
const sportsLine = {
  margin: "2px 0 0",
  fontSize: 12,
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const sportsSubline = {
  margin: 0,
  fontSize: 11,
  color: "#999",
};
