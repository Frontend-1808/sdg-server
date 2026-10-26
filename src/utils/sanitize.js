import sanitizeHtml from "sanitize-html";

const size = [/^\d{1,4}(px|%)$/];
const colors = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.]+\)$/];

export function cleanArticleHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "img",
      "video",
      "source",
      "span",
      "u",
      "s",
      "figure",
      "figcaption",
      "sup",
      "sub",
      "iframe",
    ],
    allowedAttributes: {
      "*": ["style"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      video: ["src", "controls", "preload"],
      source: ["src", "type"],
      iframe: [
        "src",
        "width",
        "height",
        "allowfullscreen",
        "frameborder",
        "allow",
      ],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        "max-width": size,
        width: size,
        height: [/^(\d{1,4}(px|%)|auto)$/],
        color: colors,
        "background-color": colors,
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
      "drive.google.com",
    ],
    transformTags: {
      // Sahifada h1 faqat bitta bo'ladi, maqola ichidagisi h2 ga aylanadi
      h1: "h2",
      a: (tagName, attribs) => ({
        tagName,
        attribs:
          attribs.target === "_blank"
            ? { ...attribs, rel: "noopener noreferrer" }
            : attribs,
      }),
    },
  });
}
