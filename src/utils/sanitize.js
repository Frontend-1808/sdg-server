import sanitizeHtml from 'sanitize-html'

const length = /^(?:(?:-?\d{1,4}(?:\.\d+)?(?:px|em|rem|%|pt)?|auto)\s*){1,4}$/i
const size = /^(?:\d{1,4}(?:\.\d+)?(?:px|em|rem|%)|auto|0)$/i
const color =
  /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)|[a-z]{3,20})$/i
const border =
  /^(?:none|0|\d{1,2}(?:\.\d+)?(?:px|em|rem)?(?:\s+(?:solid|dashed|dotted|double|none))?(?:\s+(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.]+\)|[a-z]{3,20}))?)$/i

const styles = {
  'text-align': [/^(left|right|center|justify)$/],
  'vertical-align': [/^(top|middle|bottom|baseline|text-top|text-bottom|sub|super)$/],
  color: [color],
  'background-color': [color],
  background: [color],
  'font-size': [
    /^\d{1,3}(?:\.\d+)?(?:px|em|rem|pt|%)$/i,
    /^(?:small|medium|large|x-large|xx-large|smaller|larger)$/i,
  ],
  'font-weight': [/^(?:normal|bold|bolder|lighter|[1-9]00)$/],
  'font-style': [/^(?:normal|italic|oblique)$/],
  'font-family': [/^[a-z0-9\s,'"-]{1,100}$/i],
  'line-height': [/^(?:normal|\d(?:\.\d+)?|\d{1,3}(?:\.\d+)?(?:px|em|rem|%|pt))$/i],
  'letter-spacing': [/^(?:normal|-?\d{1,2}(?:\.\d+)?(?:px|em|rem))$/i],
  'text-indent': [length],
  'text-decoration': [/^(?:none|underline|line-through|overline)(?:\s(?:underline|line-through|overline))*$/],
  'white-space': [/^(?:normal|nowrap|pre|pre-wrap)$/],
  'list-style-type': [
    /^(?:disc|circle|square|decimal|lower-alpha|upper-alpha|lower-roman|upper-roman|none)$/,
  ],
  float: [/^(?:left|right|none)$/],
  width: [size],
  'min-width': [size],
  'max-width': [size],
  height: [size],
  'border-collapse': [/^(?:collapse|separate)$/],
  'border-spacing': [length],
  'border-radius': [length],
}

for (const p of [
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
]) {
  styles[p] = [length]
}

for (const p of ['border', 'border-top', 'border-right', 'border-bottom', 'border-left']) {
  styles[p] = [border]
}

const boxAttrs = ['colspan', 'rowspan', 'align', 'valign', 'width', 'height', 'bgcolor']

export function cleanArticleHtml(html = '') {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'h1', 'h2', 'img', 'video', 'source', 'span', 'u', 's',
      'figure', 'figcaption', 'sup', 'sub', 'iframe',
    ],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      video: ['src', 'controls', 'preload'],
      source: ['src', 'type'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'allow'],
      table: ['border', 'cellpadding', 'cellspacing', 'align', 'width', 'bgcolor'],
      td: boxAttrs,
      th: boxAttrs,
      tr: ['align', 'valign', 'bgcolor'],
    },
    allowedStyles: { '*': styles },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: [
      'www.youtube.com',
      'www.youtube-nocookie.com',
      'player.vimeo.com',
      'drive.google.com',
    ],
    transformTags: {
      // Sahifada h1 faqat bitta bo'ladi, maqola ichidagisi h2 ga aylanadi
      h1: 'h2',
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
      }),
    },
  })
}
