// EMBA_Website_v3/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Alias '@' aponta para a RAIZ desta pasta
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
