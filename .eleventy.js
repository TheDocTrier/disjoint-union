module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/static");

  eleventyConfig.addShortcode(
    "relme",
    (name, href) => `<a rel="me" href="${encodeURI(href)}">${name}</a>`
  );

  // markdown
  let md = require("markdown-it");
  let mdLib = md({ html: true })
    .use(require("markdown-it-anchor"))
    .use(require("markdown-it-emoji"), { shortcuts: {} })
    .use(require("markdown-it-link-attributes"), {
      pattern: /^https?:\/\//,
      attrs: {
        class: "external-link",
        target: "_blank",
      },
    });
  eleventyConfig.setLibrary("md", mdLib);

  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};
