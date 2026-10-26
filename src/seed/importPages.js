import "dotenv/config";
import mongoose from "mongoose";
import * as cheerio from "cheerio";
import Goal from "../models/Goal.js";
import Page from "../models/Page.js";
import Document from "../models/Document.js";
import Setting from "../models/Setting.js";
import { cleanArticleHtml } from "../utils/sanitize.js";

const O = "https://sdg.nsumt.uz";

const flat = (s = "") => s.replace(/\s+/g, " ").trim();

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NSUMT import script)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

async function fetchAbout() {
  const url = `${O}/about.html`;
  const html = await download(url);

  let start = 0;
  const at = html.search(/impactrankings/i);
  const close = at !== -1 ? html.indexOf("</a>", at) : -1;
  if (close !== -1) start = close + 4;
  else console.warn("  impact marker not found, the whole page will be used");

  let end = html.length;
  const addr = html.indexOf("Galaba Avenue", start);
  if (addr !== -1) {
    const footer = html.lastIndexOf("<footer", addr);
    end = footer > start ? footer : html.lastIndexOf("<", addr);
  }

  const $ = cheerio.load(html.slice(start, Math.max(end, start)), null, false);
  $("script, style, noscript, link, meta, form, button, nav").remove();

  const abs = (v) => {
    try {
      return new URL(v, url).href;
    } catch {
      return v;
    }
  };
  $("img, source, video, iframe").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", abs(src));
  });
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !/^(mailto:|tel:|#)/i.test(href)) $(el).attr("href", abs(href));
  });

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const t = flat($(el).text()).toLowerCase();
    const phone = /^[+\d][\d\s,+()-]{8,}$/.test(t);
    if (
      ["contact", "social contract", "about us", "nsumt"].includes(t) ||
      phone
    )
      $(el).remove();
  });

  const text = flat($.text());
  console.log(`  starts: ${text.slice(0, 80)}`);
  console.log(`  ends:   ${text.slice(-80)}`);

  return cleanArticleHtml($.html());
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Sayt sozlamalari
  await Setting.findOneAndUpdate(
    { key: "main" },
    {
      siteName: "NSUMT",
      logo: `${O}/logo.png`,
      impactLogo: `${O}/img/impactlogo.png`,
      impactUrl: "https://www.timeshighereducation.com/impactrankings",
      heroTitle: "17 Sustainable Development Goals aimed at changing the world",
      heroText:
        "See how our university works for poverty reduction, quality education, clean energy, equality and partnership.",
      phones: ["+99897-068-19-85", "+99891-308-33-25"],
      address: "210100, Galaba Avenue 76v, Navoi, Navoi region, Uzbekistan",
      email: "ndktu@gmail.com",
      footerAbout:
        "Navoi State University of Mining and Technologies is one of the leading universities of the Republic of Uzbekistan, which provides comprehensive training of engineering specialists for various industries. The main goal of the university has always been and remains the training of highly qualified and competitive professionals who know and love their job, who are able to make competent decisions in any conditions.",
      socials: [
        { label: "Telegram", url: "https://t.me/ndkiofficial" },
        {
          label: "Facebook",
          url: "https://www.facebook.com/navoiydavlat.konchilikinstituti.1",
        },
        {
          label: "Instagram",
          url: "https://www.instagram.com/navoiydavlatkonchilikinstituti/",
        },
        {
          label: "YouTube",
          url: "https://www.youtube.com/channel/UCKQtUSMB1dw0ikzbeCEYEWA",
        },
      ],
      menu: [
        { label: "Home", path: "/" },
        { label: "Document", path: "/documents" },
        { label: "About us", path: "/about" },
      ],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log("Settings saved");

  // 2. About us sahifasi
  console.log("Importing About us");
  const content = await fetchAbout();
  await Page.findOneAndUpdate(
    { slug: "about" },
    { title: "About us", content, published: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`About us saved (${content.length} characters)`);

  // 3. Hujjatlar
  await Document.findOneAndUpdate(
    { goalNumber: 0, title: "All SDG documents" },
    {
      image: `${O}/img/document/all.jpg`,
      fileUrl: `${O}/file/2.pdf`,
      order: 0,
      published: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const goals = await Goal.find({ number: { $lte: 17 } }).sort({ number: 1 });
  for (const g of goals) {
    await Document.findOneAndUpdate(
      { goalNumber: g.number },
      {
        title: `SDG ${g.number}: ${g.get("title.en")}`,
        image: `${O}/img/${g.number}.png`,
        order: g.number,
        published: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  console.log(`Documents saved (${goals.length + 1})`);

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
