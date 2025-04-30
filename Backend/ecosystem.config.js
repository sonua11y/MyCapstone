module.exports = {
  apps: [{
    name: "csv-watcher",
    script: "./watcher.js",
    watch: false,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production",
      CSV_PATH: "C:/Users/sripr/Downloads/My Mock Data.csv"
    }
  }]
}; 