// next.config.js (na raiz)
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Diz ao Webpack que "@/..." aponta para EMBA_Website_v3
    config.resolve.alias['@'] = path.join(__dirname, 'EMBA_Website_v3');
    return config;
  },
};

module.exports = nextConfig;
