import { JSDOM } from "jsdom";

const config = function (eleventyConfig: any) {
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addCollection("allByUrl", function (collectionApi) {
    return collectionApi.getAll().sort(function (a, b) {
      if (a.url < b.url) return -1;
      if (a.url > b.url) return +1;
      return 0;
    });
  });

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
