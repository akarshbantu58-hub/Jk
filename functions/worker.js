/**
 * J.A.R.V.I.S Mobile Edition — optional scheduled Telegram briefing.
 * Configure TOKEN and CHAT_ID as Cloudflare Worker secrets.
 * Optional variables: WEATHER_LAT, WEATHER_LON.
 */
const DEFAULT_LAT = "16.5062";
const DEFAULT_LON = "80.6480";

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(sendBriefing(env));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
    if (url.pathname === "/health") return Response.json({ ok: true, service: "JARVIS automation" });
    if (url.pathname === "/run") {
      const auth = request.headers.get("Authorization");
      if (!env.TEST_SECRET || auth !== `Bearer ${env.TEST_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      await sendBriefing(env);
      return Response.json({ ok: true, message: "Briefing sent" });
    }
    return new Response("J.A.R.V.I.S Automation Engine online.");
  }
};

async function sendBriefing(env) {
  if (!env.TOKEN || !env.CHAT_ID) throw new Error("Configure TOKEN and CHAT_ID Worker secrets first.");
  const [weather, headlines] = await Promise.all([getWeather(env), getAINews()]);
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short", year: "numeric"
  }).format(now);
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true
  }).format(now);
  const message = [
    "🤖 GOOD MORNING, BOSS",
    "",
    `📅 ${date}`,
    `🕒 ${time} IST`,
    "",
    `🌦 WEATHER: ${weather}`,
    "",
    "🧠 AI & TECH HEADLINES:",
    headlines,
    "",
    "Have a productive day. 🚀"
  ].join("\n");
  const response = await fetch(`https://api.telegram.org/bot${env.TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text: message, disable_web_page_preview: true })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.description || "Telegram delivery failed.");
}

async function getWeather(env) {
  try {
    const lat = encodeURIComponent(env.WEATHER_LAT || DEFAULT_LAT);
    const lon = encodeURIComponent(env.WEATHER_LON || DEFAULT_LON);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=Asia%2FKolkata`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather unavailable");
    const data = await response.json();
    const current = data.current;
    return `${current.temperature_2m}°C, feels like ${current.apparent_temperature}°C, humidity ${current.relative_humidity_2m}%`;
  } catch {
    return "Weather data unavailable";
  }
}

async function getAINews() {
  try {
    const response = await fetch("https://hn.algolia.com/api/v1/search?tags=story&query=AI&hitsPerPage=4");
    if (!response.ok) throw new Error("News unavailable");
    const data = await response.json();
    const lines = (data.hits || []).slice(0, 4).map((item, index) => `${index + 1}. ${item.title}`);
    return lines.join("\n") || "No major headlines found.";
  } catch {
    return "Could not retrieve headlines today.";
  }
}
