import twemoji = require("twemoji");

import { JSDOM } from "jsdom";

const config = function (eleventyConfig: any) {
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addShortcode(
    "relme",
    (name: string, href: string) =>
      `<a rel="me" href="${encodeURI(href)}">${name}</a>`
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
