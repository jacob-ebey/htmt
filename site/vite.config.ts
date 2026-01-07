import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  build: {
    rollupOptions: {
      input: [
        "site/index.html",
        "site/partial-form-post.html",
        "site/partial-form.html",
        "site/partial-template.html",
        "site/partial.html",
      ],
    },
  },
  plugins: [
    {
      name: "dev-server",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Allow the request through but change it to GET so Vite's dev server can handle it
          if (req.url === "/partial-form-post" && req.method === "POST") {
            req.method = "GET";
          }
          next();
        });
      },
    },
  ],
});
