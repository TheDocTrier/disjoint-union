let is_prod = process.env.NODE_ENV === "production";

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: is_prod ? {} : false,
    cssnano: is_prod
      ? {
          preset: "default",
        }
      : false,
  },
};
