import "dotenv/config";
import mongoose from "mongoose";
import * as cheerio from "cheerio";
import Goal from "../models/Goal.js";
import Article from "../models/Article.js";
import ServiceCard from "../models/ServiceCard.js";
import { cleanArticleHtml } from "../utils/sanitize.js";

const ORIGIN = "https://sdg.nsumt.uz";

const SUBTITLE = "No Poverty at NSUMT";

const INTRO = `
<p>Navoi State University of Mining and Technologies is actively advancing Sustainable Development Goal 1: No Poverty by implementing inclusive policies and comprehensive support systems for students from low-income and socially vulnerable backgrounds.</p>
<p>Through financial aid, scholarships, housing and food assistance, mental and physical health services, and entrepreneurship training, NSUMT ensures that economic hardship does not stand in the way of access to quality higher education. These efforts reflect the university’s strong commitment to poverty reduction and social equity in line with national and global development goals.</p>
`;

const ARTICLES = [
  {
    slug: "anti-poverty-programs",
    title: "Anti-Poverty Programs",
    url: `${ORIGIN}/sdg-1/poverty.html`,
    cover: `${ORIGIN}/sdg-1/img/poverty/img1.png`,
    order: 1,
  },
  {
    slug: "inclusive-wellness-programs",
    title: "Inclusive Wellness Programs",
    url: `${ORIGIN}/sdg-1/service.html`,
    cover: "https://i.ytimg.com/vi/rp_xxrksXdk/maxresdefault.jpg",
    order: 2,
  },
  {
    slug: "support-for-sustainable-growth",
    title: "Support for Sustainable Growth",
    url: `${ORIGIN}/sdg-1/support.html`,
    cover: `${ORIGIN}/sdg-1/img/support/img1.png`,
    order: 3,
  },
];

const POLICY_URL =
  "https://drive.google.com/file/d/1iKKQby0oy1fCP3iYTvNRbzubxe8WyFQp/view?usp=drive_link";

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NSUMT import script)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

// Sahifaning "Home" havolasidan keyingi qismini footerdagi manzilgacha kesib oladi
function extractContent(html, pageUrl) {
  let start = 0;
  const homeAt = html.search(/>\s*Home\s*</i);
  if (homeAt !== -1) {
    const closeAt = html.indexOf("</a>", homeAt);
    start = closeAt !== -1 ? closeAt + 4 : homeAt;
  } else {
    console.warn("  Home marker not found, the whole page will be used");
    start = Math.max(html.search(/<body/i), 0);
  }

  let end = html.length;
  const addressAt = html.indexOf("Galaba Avenue");
  if (addressAt > start) {
    const footerAt = html.lastIndexOf("<footer", addressAt);
    end = footerAt > start ? footerAt : html.lastIndexOf("<", addressAt);
  }

  const $ = cheerio.load(html.slice(start, end), null, false);
  $("script, style, noscript, link, meta, form, button").remove();

  const toAbsolute = (value) => {
    if (!value || value.startsWith("#")) return value;
    try {
      return new URL(value, pageUrl).href;
    } catch {
      return value;
    }
  };

  $("img, source, video").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", toAbsolute(src));
  });
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) $(el).attr("href", toAbsolute(href));
  });

  const text = $.text().replace(/\s+/g, " ").trim();
  console.log(`  starts: ${text.slice(0, 90)}`);
  console.log(`  ends:   ${text.slice(-90)}`);

  return cleanArticleHtml($.html());
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const goal = await Goal.findOne({ slug: "sdg-1" });
  if (!goal) throw new Error("SDG 1 is not in the database. Run: npm run seed");

  goal.set("subtitle.en", SUBTITLE);
  goal.set("introText.en", INTRO.trim());
  goal.template = "services";
  await goal.save();
  console.log("Goal SDG 1 updated");

  const articleIds = {};

  for (const a of ARTICLES) {
    console.log(`Importing ${a.url}`);
    try {
      const content = extractContent(await download(a.url), a.url);
      const doc = await Article.findOneAndUpdate(
        { goal: goal._id, slug: a.slug },
        {
          title: a.title,
          content,
          coverImage: a.cover,
          published: true,
          order: a.order,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      articleIds[a.slug] = doc._id;
      console.log(`  saved: ${a.slug} (${content.length} characters)`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  const cards = [
    {
      title: "Anti-Poverty Programs",
      image: ARTICLES[0].cover,
      article: "anti-poverty-programs",
      order: 1,
    },
    {
      title: "Inclusive Wellness Programs",
      image: ARTICLES[1].cover,
      article: "inclusive-wellness-programs",
      order: 2,
    },
    {
      title: "Support for Sustainable Growth",
      image: ARTICLES[2].cover,
      article: "support-for-sustainable-growth",
      order: 3,
    },
    {
      title: "Policy",
      image: `${ORIGIN}/sdg-1/img/img3.jpg`,
      externalUrl: POLICY_URL,
      order: 4,
    },
  ];

  for (const c of cards) {
    const external = Boolean(c.externalUrl);
    const articleId = external ? null : articleIds[c.article];
    if (!external && !articleId) {
      console.warn(`  Card skipped (article missing): ${c.title}`);
      continue;
    }
    await ServiceCard.findOneAndUpdate(
      { goal: goal._id, title: c.title },
      {
        image: c.image,
        linkType: external ? "external" : "article",
        article: articleId,
        externalUrl: external ? c.externalUrl : "",
        order: c.order,
        published: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`Card saved: ${c.title}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
