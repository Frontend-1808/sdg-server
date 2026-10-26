import Setting from "../models/Setting.js";

const str = (v, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const isHttp = (v) => /^https?:\/\/\S+$/i.test(v);

async function getOrCreate() {
  return (
    (await Setting.findOne({ key: "main" })) ||
    (await Setting.create({ key: "main" }))
  );
}

export const getSettings = async (req, res) => {
  res.json(await getOrCreate());
};

export const updateSettings = async (req, res) => {
  const b = req.body || {};

  const data = {
    siteName: str(b.siteName, 100),
    logo: str(b.logo),
    impactLogo: str(b.impactLogo),
    impactUrl: str(b.impactUrl),
    heroTitle: str(b.heroTitle, 200),
    heroText: str(b.heroText, 600),
    address: str(b.address, 300),
    email: str(b.email, 100),
    footerAbout: str(b.footerAbout, 2000),
    phones: Array.isArray(b.phones)
      ? b.phones
          .map((p) => str(p, 40))
          .filter(Boolean)
          .slice(0, 10)
      : [],
    socials: Array.isArray(b.socials)
      ? b.socials
          .map((s) => ({ label: str(s?.label, 40), url: str(s?.url) }))
          .filter((s) => s.label && isHttp(s.url))
          .slice(0, 10)
      : [],
    menu: Array.isArray(b.menu)
      ? b.menu
          .map((m) => ({ label: str(m?.label, 40), path: str(m?.path, 300) }))
          .filter((m) => m.label && /^(\/|https?:\/\/)\S*$/i.test(m.path))
          .slice(0, 10)
      : [],
  };

  if (!data.siteName)
    return res.status(400).json({ message: "Site name is required" });
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    return res.status(400).json({ message: "Email address is not valid" });
  }
  if (data.impactUrl && !isHttp(data.impactUrl)) {
    return res
      .status(400)
      .json({
        message: "Impact Rankings link must start with http:// or https://",
      });
  }

  const doc = await Setting.findOneAndUpdate({ key: "main" }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  res.json(doc);
};
