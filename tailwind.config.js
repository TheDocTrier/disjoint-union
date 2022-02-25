module.exports = {
  content: ["./src/**/*.html", "./src/**/*.md"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "blockquote p:first-of-type::before": false,
            "blockquote p:first-of-type::after": false,
            blockquote: {
              "font-weight": "inherit",
              "font-style": "inherit",
            },
            a: {
              "text-underline-offset": "4px",
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
