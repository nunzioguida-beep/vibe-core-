const TAVILY_URL = "https://api.tavily.com/search";

export async function searchWellhub(query: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `Wellhub ${query}`,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
      }),
    });

    if (!res.ok) return "";

    const data = await res.json() as { results?: { title: string; content: string; url: string }[] };
    const results = data.results ?? [];
    if (!results.length) return "";

    return results.map(r => `[${r.title}]\n${r.content.slice(0, 400)}`).join("\n\n");
  } finally {
    clearTimeout(timeout);
  }
}
