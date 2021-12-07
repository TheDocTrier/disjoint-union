module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addShortcode(
    "relme",
    (name, href) => `<a rel="me" href="${encodeURI(href)}">${name}</a>`
  );

  // markdown
  let md = require("markdown-it");
  let mdLib = md({ html: true })
    .use(require("markdown-it-anchor"))
    .use(require("markdown-it-emoji"), { shortcuts: {} });
  eleventyConfig.setLibrary("md", mdLib);

  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};
