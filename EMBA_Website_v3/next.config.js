// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Mapeia "@/..." para a pasta onde estão os teus ficheiros
    // ⚠️ Usa exatamente o nome da pasta: EMBA_Website_v3
    config.resolve.alias['@'] = path.join(__dirname, 'EMBA_Website_v3');
    return config;
  },
};

module.exports = nextConfig;
