import { JSDOM } from "jsdom";
import { DateTime } from "luxon";
const isProd = process.env.NODE_ENV === "production";

const config = function (eleventyConfig: any) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.addWatchTarget("./src/style.css");
  eleventyConfig.addPlugin(require("eleventy-plugin-ignore"));

  eleventyConfig.addPassthroughCopy("./src/static");
  if (!isProd) eleventyConfig.addPassthroughCopy("./static");
  eleventyConfig.addPassthroughCopy("./src/_redirects");

  // global production detection
  eleventyConfig.addGlobalData("isProd", isProd);

  // generate static urls
  function getStatic(r: string) {
    if (false && isProd) {
      // this was/is a stopgap solution, now we use temporary redirects
      return `https://static.disjointunion.link${r}`;
    } else {
      return `/static${r}`;
    }
  }
  eleventyConfig.addFilter("static", getStatic);

  // collection for sitemap
  eleventyConfig.addCollection("allByUrl", function (collectionApi) {
    return collectionApi.getAll().sort(function (a, b) {
      if (a.url < b.url) return -1;
      if (a.url > b.url) return +1;
      return 0;
    });
  });

  // select list of attributes from a list of objects
  eleventyConfig.addFilter("map", (l: unknown[], attr: string) =>
    l.map((x) => x[attr])
  );

  // array-ify if only a single non-array
  eleventyConfig.addFilter("arrayify", (x: unknown) =>
    Array.isArray(x) ? x : [x]
  );

  eleventyConfig.addFilter("concat", (a: any[], b: any[]) => a.concat(b));

  // rel=me helper
  eleventyConfig.addShortcode(
    "rel",
    (rel: string, name: string, href: string) =>
      `<a rel="${rel}" href="${href}">${name}</a>`
  );

  // resolve local paths
  function resolve(path: string) {
    return path.startsWith("/") ? path : this.page.url + path;
  }
  eleventyConfig.addFilter("resolve", resolve);

  // image with thumbnail helper
  const imgT = (thumb: string, alt: string, full: string) =>
    `<a title="${alt}" href="${full}"><img alt="${alt}" src="${thumb}"/></a>`;
  eleventyConfig.addShortcode("imgT", imgT);
  function imgST(name: string, alt: string) {
    const resolved: string = resolve.bind(this)(name);
    return imgT(
      getStatic(resolved.replace(/\..+?$/, "_thumb$&")),
      alt,
      getStatic(resolved)
    );
  }
  eleventyConfig.addShortcode("imgST", imgST);

  // Table of Contents
  eleventyConfig.addPlugin(require("eleventy-plugin-toc"), { ul: true });

  // tag date as if its year-month-day is given in Los_Angeles tz
  const tagDate = (date: Date, cls: string) => {
    const origDate = DateTime.fromJSDate(date, { zone: "utc" });
    const lDate = DateTime.fromObject(
      {
        year: origDate.year,
        month: origDate.month,
        day: origDate.day,
      },
      { zone: "America/Los_Angeles" }
    );
    return `<time datetime="${lDate.toISO()}" class="${cls}">${lDate.toFormat(
      "yyyy-MM-dd"
    )}</time>`;
  };
  eleventyConfig.addFilter("tagDate", tagDate);

  // markdown
  const mdLib = require("markdown-it");
  let md = mdLib({ html: true, linkify: false, typographer: true })
    .use(require("markdown-it-anchor"), {
      slugify: eleventyConfig.getFilter("slugify"),
    })
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
  eleventyConfig.addFilter("markdown", (x) => md.renderInline(x));

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
                link.rel += " noreferrer noopener";
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
