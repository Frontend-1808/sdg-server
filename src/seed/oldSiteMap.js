export const ORIGIN = "https://sdg.nsumt.uz";
const O = ORIGIN;

// Bir sahifali SDG: sahifa matni kirish matni bo'ladi, ichki havolalar maqola bo'ladi
const page = (file) => ({ mode: "page", url: `${O}/pages/${file}` });

// Kartochkali SDG
export const GOALS = {
  2: page("zero_hunger.html"),
  3: page("good_health.html"),

  4: {
    mode: "cards",
    url: `${O}/sdg-4/index.html`,
    introEnd: "Our Services",
    cards: [
      {
        title: "Access to Educational Resources",
        image: `${O}/sdg-4/img/img1.jpg`,
        url: `${O}/sdg-4/library.html`,
      },
      {
        title: "Education Sustainability",
        image:
          "https://straighthealth.com/wp-content/uploads/2015/10/textbooks.jpg",
        url: `${O}/sdg-4/edu.html`,
      },
      {
        title: "Lifelong Learning",
        image: `${O}/sdg-4/img/img2.jpg`,
        url: `${O}/sdg-4/life.html`,
      },
      {
        title: "Policy",
        image: `${O}/sdg-4/img/img3.jpg`,
        external:
          "https://drive.google.com/file/d/1B500l46DwgYyIkiXWC3b41UXcvWspmIj/preview",
      },
    ],
  },

  5: {
    mode: "cards",
    url: `${O}/sdg-5/index.html`,
    cards: [
      { title: "Empowering Women Equally", url: `${O}/sdg-5/empower.html` },
      { title: "Women Advancement Policy", url: `${O}/sdg-5/advancement.html` },
      {
        title: "Women's Support Community",
        url: `${O}/pages/gender_equality.html`,
      },
    ],
  },

  6: page("clean_water.html"),

  7: {
    mode: "cards",
    url: `${O}/sdg-7/index.html`,
    introEnd: "energy.html",
    cards: [
      { title: "Energy efficiency", url: `${O}/sdg-7/energy.html` },
      { title: "Path to Sustainable Energy", url: `${O}/sdg-7/path.html` },
      { title: "Renewable Energy", url: `${O}/sdg-7/renewable.html` },
      {
        title: "Policy: Impactful Programs on Energy and Climate Change",
        external:
          "https://docs.google.com/document/d/1l686XUpZgY_NdxA88NfRdXEed0vV-qzc/edit?usp=drive_link&ouid=113888671417117764718&rtpof=true&sd=true",
      },
      {
        title: "Policy: Energy and Carbon Emission Reduction",
        external:
          "https://drive.google.com/file/d/17Qplmm7H0zJ36wH2I3ye126tq34tlptY/view?usp=drive_link",
      },
      {
        title: "Policy: Net Zero Commitment",
        external:
          "https://drive.google.com/file/d/1H7o9bUpNtT_UYwH5HOIXYn5_8LFGPkYa/view?usp=drive_link",
      },
    ],
  },

  8: page("decent_work.html"),
  9: page("industry_innovation.html"),
  10: page("reduced_inequalities.html"),

  11: {
    mode: "cards",
    url: `${O}/sdg-11/index.html`,
    cards: [
      {
        title: "Access to green spaces",
        image: `${O}/sdg-11/images/wedo-img2.png`,
        url: `${O}/sdg-11/green.html`,
      },
      {
        title: "Contribution to the Arts",
        image: `${O}/sdg-11/images/wedo-img3.png`,
        url: `${O}/sdg-11/arts.html`,
      },
      {
        title: "Housing and Infrastructure",
        image: `${O}/sdg-11/images/wedo-img4.png`,
        url: `${O}/sdg-11/housing.html`,
      },
      {
        title: "Policy",
        image: `${O}/sdg-11/images/wedo-img3.png`,
        external:
          "https://drive.google.com/file/d/1WfOs8D0hSsv9PvpfOgo2fO8S_J-O2-La/view?usp=drive_link",
      },
    ],
  },

  12: page("responsible.html"),
  13: page("climate_action.html"),
  14: page("life_below.html"),
  15: page("life_on_land.html"),
  16: page("Peace_justice.html"),

  17: {
    mode: "cards",
    url: `${O}/sdg-17/index.html`,
    cover: `${O}/sdg-17/img/collaboration/the_main.jpg`,
    cards: [
      {
        title: "Collaboration",
        url: `${O}/sdg-17/files/collaboration/collaboration.html`,
      },
      {
        title: "Commitment",
        url: `${O}/sdg-17/files/collaboration/commitment.html`,
      },
      {
        title: "Global Cooperation",
        url: `${O}/sdg-17/files/collaboration/cooperation.html`,
      },
      { title: "Reports", url: `${O}/sdg-17/files/collaboration/reports.html` },
      {
        title: "Sustainability through Collaborative Endeavors",
        url: `${O}/sdg-17/files/collaboration/endeavors.html`,
      },
    ],
  },

  18: {
    mode: "cards",
    url: `${O}/sdg-18/index.html`,
    title: "Interdisciplinary Research",
    cards: [
      {
        title: "Measuring Interdisciplinary Research Success",
        url: `${O}/sdg-18/inter1/index.html`,
      },
      {
        title:
          "Dedicated Physical Facilities for Interdisciplinary Research at NSUMT",
        url: `${O}/sdg-18/inter2/index.html`,
      },
      {
        title: "Institutional Support and Career Recognition",
        url: `${O}/sdg-18/inter3/index.html`,
      },
    ],
  },
};
