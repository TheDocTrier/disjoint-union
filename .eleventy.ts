import { JSDOM } from "jsdom";
import { DateTime } from "luxon";

const config = function (eleventyConfig: any) {
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // collection for sitemap
  eleventyConfig.addCollection("allByUrl", function (collectionApi) {
    return collectionApi.getAll().sort(function (a, b) {
      if (a.url < b.url) return -1;
      if (a.url > b.url) return +1;
      return 0;
    });
  });

  // rel=me helper
  eleventyConfig.addShortcode(
    "relme",
    (name: string, href: string) =>
      `<a rel="me" href="${encodeURI(href)}">${name}</a>`
  );

  // typical date formatting
  const fmtDate = (date: Date, fmt = "yyyy/MM/dd, t (ZZZZ)") =>
    DateTime.fromJSDate(date).toFormat(fmt);
  eleventyConfig.addFilter("fmtDate", fmtDate);
  eleventyConfig.addShortcode("fmtDate", fmtDate);

  // licenses
  const licenses: { [code: string]: { name: string; href: string } } = {
    "by-sa": {
      name: "CC-BY-SA 4.0",
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  };
  eleventyConfig.addFilter(
    "linkLicense",
    (code) =>
      `<a class="p-license" href="${licenses[code].href}">${licenses[code].name}</a>`
  );

  // markdown
  let mdLib = require("markdown-it");
  let md = mdLib({ html: true })
    .use(require("markdown-it-anchor"))
    .use(require("markdown-it-emoji"), {
      defs: {
        ...require("markdown-it-emoji/lib/data/full.json"),
        disjoint_union: "⊔",
      },
      shortcuts: {},
    });
  md.renderer.rules.emoji = (token, idx) =>
    `<span class="emoji" title="${token[idx].markup}">${token[idx].content}</span>`;

  eleventyConfig.setLibrary("md", md);

  // code adapted from sardinev's external-links plugin (MIT license)
  eleventyConfig.addTransform(
    "external-links",
    (content: string, outputPath: string) => {
      if (outputPath && outputPath.endsWith(".html")) {
        try {
          const dom = new JSDOM(content);
          const { document } = dom.window;
          const links = document.querySelectorAll<HTMLAnchorElement>("a");

          if (links.length > 0) {
            links.forEach((link) => {
              if (/^(https?\:)?\/\//i.test(link.href)) {
                link.classList.add("external-link");
                link.target = "_blank";
              }
            });
          } else {
            return content;
          }

          return dom.serialize();
        } catch (e) {
          console.error(e);
        }
      }
      return content;
    }
  );

  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};

export = config;
