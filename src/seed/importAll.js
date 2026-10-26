import "dotenv/config";
import mongoose from "mongoose";
import * as cheerio from "cheerio";
import Goal from "../models/Goal.js";
import Article from "../models/Article.js";
import ServiceCard from "../models/ServiceCard.js";
import { cleanArticleHtml } from "../utils/sanitize.js";
import { GOALS, ORIGIN } from "./oldSiteMap.js";

const DELAY = 250; // so'rovlar orasida kutish (millisekund)
const MAX_DEPTH = 2; // maqola ichidagi ichki sahifalarga qancha chuqur kirish

const ctx = {
  done: new Map(), // manzil bo'yicha tayyor maqola
  slugMap: new Map(), // eski manzil: yangi manzil
  touched: new Set(), // shu yurgizishda yozilgan maqolalar
  failed: [],
  order: 0,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const flat = (s = "") => s.replace(/\s+/g, " ").trim();
const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const cleanTitle = (s = "") =>
  flat(s)
    .replace(/ \d{1,2}$/, "")
    .trim();

const slugify = (v = "") =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function normalize(href, base) {
  try {
    const u = new URL(href, base);
    u.hash = "";
    return u.href;
  } catch {
    return "";
  }
}

// Ichki sahifa: /pages/papka/fayl.html yoki /sdg-N/papka/fayl.html
function isSubPage(url) {
  try {
    const u = new URL(url);
    if (u.host !== new URL(ORIGIN).host) return false;
    return (
      /^\/pages\/[^/]+\/[^/]+\.html$/.test(u.pathname) ||
      /^\/sdg-\d+\/[^/]+\/[^/]+\.html$/.test(u.pathname)
    );
  } catch {
    return false;
  }
}

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NSUMT import script)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`answered ${res.status}`);
  return res.text();
}

// Sahifaning kerakli qismini kesib oladi
function sliceContent(html, pageUrl, endAt = "") {
  const isPages = new URL(pageUrl).pathname.startsWith("/pages/");
  let start = 0;
  let method = "body";

  if (isPages) {
    const at = html.search(/impactrankings/i);
    const close = at !== -1 ? html.indexOf("</a>", at) : -1;
    if (close !== -1) {
      start = close + 4;
      method = "impact";
    }
  }

  if (method === "body") {
    const at = html.search(/>\s*Home\s*</i);
    const close = at !== -1 ? html.indexOf("</a>", at) : -1;
    if (close !== -1) {
      start = close + 4;
      method = "home";
    }
  }

  if (method === "body") start = Math.max(html.search(/<body/i), 0);

  let end = html.length;
  let endIdx = -1;

  if (endAt) {
    endIdx = html.indexOf(endAt, start);
    if (endIdx !== -1) end = html.lastIndexOf("<", endIdx);
  }

  if (endIdx === -1) {
    const addr = html.indexOf("Galaba Avenue", start);
    if (addr !== -1) {
      const footer = html.lastIndexOf("<footer", addr);
      end = footer > start ? footer : html.lastIndexOf("<", addr);
    }
  }

  return { fragment: html.slice(start, Math.max(end, start)), method };
}

function buildDom(fragment, pageUrl) {
  const $ = cheerio.load(fragment, null, false);
  $("script, style, noscript, link, meta, form, button, nav").remove();

  const toAbsolute = (value) =>
    value && !value.startsWith("#")
      ? normalize(value, pageUrl) || value
      : value;

  $("img, source, video").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", toAbsolute(src));
  });
  $("iframe").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", toAbsolute(src));
  });
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !/^(mailto:|tel:)/i.test(href))
      $(el).attr("href", toAbsolute(href));
  });

  const isPages = new URL(pageUrl).pathname.startsWith("/pages/");
  const junk = ["nsumt", "contact", "social contract", "about us", "company"];
  const tabs = ["programs", "articles", "grant projects", "policy"];

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const t = flat($(el).text()).toLowerCase();
    const isPhone = /^[+\d][\d\s,+()-]{8,}$/.test(t);
    if (junk.includes(t) || isPhone || (isPages && tabs.includes(t)))
      $(el).remove();
  });

  if (isPages) {
    $("img").each((_, el) => {
      if (/\/img\/\d{1,2}\.(png|jpe?g)$/i.test($(el).attr("src") || ""))
        $(el).remove();
    });
  }

  return $;
}

function pruneEmpty($) {
  let changed = true;
  while (changed) {
    changed = false;
    $("p, li, ul, ol, div, span, section, h1, h2, h3, h4, h5, h6").each(
      (_, el) => {
        const $el = $(el);
        const empty = flat($el.text()) === "";
        if (
          empty &&
          $el.find("img, iframe, video, table, hr, source").length === 0
        ) {
          $el.remove();
          changed = true;
        }
      },
    );
  }
}

function collectSubLinks($, pageUrl) {
  const self = normalize(pageUrl, ORIGIN);
  const map = new Map();

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const url = normalize(href, pageUrl);
    if (!url || url === self || !isSubPage(url)) return;

    const title = cleanTitle($(el).text());
    const group = map.get(url) || { url, title: "", els: [] };
    if (!group.title && title) group.title = title;
    group.els.push(el);
    map.set(url, group);
  });

  return [...map.values()];
}

async function uniqueSlug(goalId, title) {
  const base = slugify(title).slice(0, 80).replace(/-+$/, "") || "article";
  let slug = base;
  let n = 2;
  while (await Article.exists({ goal: goalId, slug })) slug = `${base}-${n++}`;
  return slug;
}

async function importArticle(
  goal,
  url,
  { title = "", cover = "", depth = 0 } = {},
) {
  const key = normalize(url, ORIGIN);
  if (!key) return null;
  if (ctx.done.has(key)) return ctx.done.get(key);
  ctx.done.set(key, null);

  const pad = "  ".repeat(depth + 1);
  console.log(`${pad}page: ${key}`);

  try {
    await sleep(DELAY);
    const html = await download(key);
    const { fragment, method } = sliceContent(html, key);
    const $ = buildDom(fragment, key);

    const subs = depth < MAX_DEPTH ? collectSubLinks($, key) : [];

    let name = flat(title);
    if (!name) name = flat($("h1, h2, h3").first().text());
    if (!name) name = flat(cheerio.load(html)("title").text());
    if (!name) name = "Untitled";

    const first = $("h1, h2, h3").first();
    if (first.length && norm(first.text()) === norm(name)) first.remove();

    const text = flat($.text());
    console.log(`${pad}  [${method}] starts: ${text.slice(0, 70)}`);
    console.log(`${pad}  ends: ${text.slice(-70)}`);

    const content = cleanArticleHtml($.html());

    let article = await Article.findOne({ goal: goal._id, sourceUrl: key });
    if (article) {
      article.title = name;
      article.content = content;
      if (cover) article.coverImage = cover;
      await article.save();
    } else {
      article = await Article.create({
        goal: goal._id,
        sourceUrl: key,
        slug: await uniqueSlug(goal._id, name),
        title: name,
        content,
        coverImage: cover,
        order: ++ctx.order,
        published: true,
      });
    }

    ctx.done.set(key, article);
    ctx.touched.add(String(article._id));
    ctx.slugMap.set(key, `/goals/${goal.slug}/${article.slug}`);

    for (const s of subs) {
      await importArticle(goal, s.url, { title: s.title, depth: depth + 1 });
    }

    return article;
  } catch (err) {
    console.error(`${pad}  FAILED: ${err.message}`);
    ctx.failed.push(`${key}: ${err.message}`);
    return null;
  }
}

async function importGoal(number, cfg) {
  const goal = await Goal.findOne({ number });
  if (!goal) {
    console.warn(`SDG ${number} is not in the database`);
    return;
  }

  console.log(`\nSDG ${number}: ${goal.get("title.en")}`);
  ctx.order = 0;

  let intro = "";
  const cards = [];

  if (cfg.mode === "page") {
    const html = await download(cfg.url);
    const { fragment, method } = sliceContent(html, cfg.url);
    const $ = buildDom(fragment, cfg.url);
    $("h1").first().remove();

    const groups = collectSubLinks($, cfg.url);
    groups.forEach((g) => g.els.forEach((el) => $(el).remove()));
    pruneEmpty($);

    const text = flat($.text());
    console.log(`  [${method}] intro starts: ${text.slice(0, 70)}`);
    console.log(`  intro ends: ${text.slice(-70)}`);
    console.log(`  sub pages found: ${groups.length}`);

    if (text.length > 20 || $("img, iframe").length)
      intro = cleanArticleHtml($.html());

    for (const g of groups) {
      const art = await importArticle(goal, g.url, { title: g.title });
      if (art) cards.push({ title: art.title, image: "", article: art._id });
    }
  } else {
    if (cfg.introEnd) {
      const html = await download(cfg.url);
      const { fragment, method } = sliceContent(html, cfg.url, cfg.introEnd);
      const $ = buildDom(fragment, cfg.url);
      pruneEmpty($);
      const text = flat($.text());
      console.log(`  [${method}] intro starts: ${text.slice(0, 70)}`);
      console.log(`  intro ends: ${text.slice(-70)}`);
      if (text.length > 20) intro = cleanArticleHtml($.html());
    }

    for (const c of cfg.cards) {
      if (c.external) {
        cards.push({
          title: c.title,
          image: c.image || "",
          externalUrl: c.external,
        });
      } else {
        const art = await importArticle(goal, c.url, {
          title: c.title,
          cover: c.image || "",
        });
        if (art)
          cards.push({
            title: c.title,
            image: c.image || "",
            article: art._id,
          });
      }
    }
  }

  let order = 0;
  for (const c of cards) {
    order += 1;
    const filter = c.externalUrl
      ? { goal: goal._id, linkType: "external", externalUrl: c.externalUrl }
      : { goal: goal._id, article: c.article };

    await ServiceCard.findOneAndUpdate(
      filter,
      {
        title: c.title,
        image: c.image,
        linkType: c.externalUrl ? "external" : "article",
        article: c.article || null,
        externalUrl: c.externalUrl || "",
        order,
        published: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  if (intro) goal.set("introText.en", intro);
  goal.template = cards.length ? "services" : "simple";
  if (cfg.cover) goal.coverImage = cfg.cover;
  if (cfg.title && goal.get("title.en") === "Goal 18")
    goal.set("title.en", cfg.title);
  await goal.save();

  console.log(`  saved: intro ${intro ? "yes" : "no"}, cards ${cards.length}`);
}

// Maqola ichidagi eski havolalarni yangi manzillarga almashtiradi
async function rewriteLinks() {
  let changedCount = 0;
  for (const id of ctx.touched) {
    const article = await Article.findById(id);
    if (!article) continue;

    const $ = cheerio.load(article.content, null, false);
    let changed = false;

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const to = ctx.slugMap.get(normalize(href, ORIGIN));
      if (to) {
        $(el).attr("href", to);
        $(el).removeAttr("target");
        changed = true;
      }
    });

    if (changed) {
      article.content = cleanArticleHtml($.html());
      await article.save();
      changedCount += 1;
    }
  }
  console.log(`\nLinks rewritten in ${changedCount} articles`);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const only = process.argv[2] ? Number(process.argv[2]) : null;
  if (only !== null && !GOALS[only]) {
    throw new Error(
      `SDG ${only} is not in oldSiteMap.js. Use 2 to 18 except 1.`,
    );
  }

  // Eski manzillar xaritasi
  const goals = await Goal.find().select("number slug");
  for (const g of goals) {
    ctx.slugMap.set(`${ORIGIN}/sdg-${g.number}/index.html`, `/goals/${g.slug}`);
    const cfg = GOALS[g.number];
    if (cfg) ctx.slugMap.set(normalize(cfg.url, ORIGIN), `/goals/${g.slug}`);
  }
  ctx.slugMap.set(`${ORIGIN}/index.html`, "/");
  ctx.slugMap.set(`${ORIGIN}/pages/documents.html`, "/documents");
  ctx.slugMap.set(`${ORIGIN}/about.html`, "/about");

  const previous = await Article.find({ sourceUrl: { $ne: "" } })
    .select("slug sourceUrl goal")
    .populate("goal", "slug");
  for (const a of previous) {
    if (a.goal) ctx.slugMap.set(a.sourceUrl, `/goals/${a.goal.slug}/${a.slug}`);
  }

  const numbers = only
    ? [only]
    : Object.keys(GOALS)
        .map(Number)
        .sort((a, b) => a - b);
  for (const n of numbers) {
    try {
      await importGoal(n, GOALS[n]);
    } catch (err) {
      console.error(`SDG ${n} FAILED: ${err.message}`);
      ctx.failed.push(`SDG ${n}: ${err.message}`);
    }
  }

  await rewriteLinks();

  console.log(`\nArticles written: ${ctx.touched.size}`);
  if (ctx.failed.length) {
    console.log(`Failed (${ctx.failed.length}):`);
    ctx.failed.forEach((f) => console.log(`  ${f}`));
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
