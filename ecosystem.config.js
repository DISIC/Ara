module.exports = {
  apps: [
    {
      name: "Frontend SPA",
      cwd: "./confiture-web-app",
      script: "npm",
      args: "run preview -- --host",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Nest API",
      script: "./confiture-rest-api/dist/main.js",
      env: {
        PORT: 4000,
        NODE_ENV: "production"
      }
    },
  ],
};