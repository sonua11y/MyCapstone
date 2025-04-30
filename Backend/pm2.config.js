module.exports = {
  apps: [{
    name: "csv-watcher",
    script: "./watcher.js",
    cwd: "./",
    watch: false,
    autorestart: false,
    env: {
      NODE_ENV: "production"
    }
  }]
}; 