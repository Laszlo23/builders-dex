/** PM2 — Builders DEX on dex.buildingcultureid.space */
module.exports = {
  apps: [
    {
      name: 'builders-dex',
      cwd: '/var/www/dex-buildingculture',
      script: 'dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3050',
        APP_URL: 'https://dex.buildingcultureid.space',
        AVANTIS_SIDECAR_DISABLE: '1',
      },
      max_memory_restart: '512M',
      autorestart: true,
    },
  ],
};
