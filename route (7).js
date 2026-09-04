import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");

  if (!team) {
    return NextResponse.json({ error: "Missing team name" }, { status: 400 });
  }

  const apiKey = process.env.SPORTSDB_API_KEY || "3";

  try {
    // Look up the team to get its ID
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(
      team
    )}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const teamId = searchData.teams?.[0]?.idTeam;

    if (!teamId) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get next and last events for that team
    const [nextRes, lastRes] = await Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${teamId}`),
      fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${teamId}`),
    ]);

    const nextData = await nextRes.json();
    const lastData = await lastRes.json();

    const nextEvent = nextData.events?.[0];
    const lastEvent = lastData.results?.[0];

    return NextResponse.json({
      teamName: searchData.teams[0].strTeam,
      badge: searchData.teams[0].strTeamBadge,
      nextEvent: nextEvent
        ? {
            opponent:
              nextEvent.strHomeTeam === team ? nextEvent.strAwayTeam : nextEvent.strHomeTeam,
            date: nextEvent.dateEvent,
            time: nextEvent.strTime,
          }
        : null,
      lastResult: lastEvent
        ? {
            home: lastEvent.strHomeTeam,
            away: lastEvent.strAwayTeam,
            homeScore: lastEvent.intHomeScore,
            awayScore: lastEvent.intAwayScore,
            date: lastEvent.dateEvent,
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json({ error: "Sports service unavailable" }, { status: 500 });
  }
}
