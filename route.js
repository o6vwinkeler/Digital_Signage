import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get("zip");

  if (!zip) {
    return NextResponse.json({ error: "Missing zip code" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
    zip
  )},us&appid=${apiKey}&units=imperial`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod && data.cod !== 200) {
      return NextResponse.json({ error: data.message || "Weather lookup failed" }, { status: 400 });
    }

    return NextResponse.json({
      city: data.name,
      tempF: Math.round(data.main.temp),
      description: data.weather?.[0]?.description || "",
      icon: data.weather?.[0]?.icon || "",
      humidity: data.main.humidity,
    });
  } catch (err) {
    return NextResponse.json({ error: "Weather service unavailable" }, { status: 500 });
  }
}
