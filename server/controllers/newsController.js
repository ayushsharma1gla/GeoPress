const Parser = require("rss-parser");

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure", { keepArray: false }],
    ],
  },
});

// Free Indian news RSS feeds – no API key required
const RSS_FEEDS = [
  {
    source: "Times of India",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  },
  {
    source: "NDTV",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
  },
  {
    source: "Hindustan Times",
    url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
  },
  {
    source: "Indian Express",
    url: "https://indianexpress.com/section/india/feed/",
  },
  {
    source: "The Hindu",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
  },
];

// In-memory cache: { all: {data, ts}, [keyword]: {data, ts} }
const newsCache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Extract the best available image from an RSS item
function extractImage(item) {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  if (item.enclosure?.url) return item.enclosure.url;
  // Try to pull first <img> from content snippet
  const match = (item["content:encoded"] || item.content || "").match(
    /<img[^>]+src=["']([^"']+)["']/i
  );
  return match ? match[1] : null;
}

// Normalize an RSS item into the shape the frontend Card expects
function normalizeItem(item, source) {
  return {
    title: item.title || "Untitled",
    description: item.contentSnippet || item.summary || item.content || "",
    url: item.link || item.guid || "#",
    image: extractImage(item),
    source,
    author: item.author || item.creator || source,
    published_at: item.pubDate || item.isoDate || new Date().toISOString(),
  };
}

// Fetch and parse a single RSS feed, silently ignoring failures
async function fetchFeed({ source, url }) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 8).map((item) => normalizeItem(item, source));
  } catch (err) {
    console.warn(`RSS fetch failed for ${source}:`, err.message);
    return [];
  }
}

// GET /api/news?keyword=&limit=12
exports.getNews = async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim().toLowerCase();
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const cacheKey = keyword || "all";

    // Serve from cache if fresh
    if (newsCache[cacheKey] && Date.now() - newsCache[cacheKey].ts < CACHE_TTL_MS) {
      const cached = newsCache[cacheKey].data.slice(0, limit);
      return res.json({ data: cached, source: "cache" });
    }

    // Fetch all feeds in parallel
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    let articles = results.flat();

    // Keyword filter
    if (keyword) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.description.toLowerCase().includes(keyword) ||
          a.source.toLowerCase().includes(keyword)
      );
    }

    // Sort newest first
    articles.sort(
      (a, b) => new Date(b.published_at) - new Date(a.published_at)
    );

    // Store in cache
    newsCache[cacheKey] = { data: articles, ts: Date.now() };

    res.json({ data: articles.slice(0, limit) });
  } catch (error) {
    console.error("News fetch error:", error);
    res.status(500).json({ message: "Failed to fetch news", data: [] });
  }
};
