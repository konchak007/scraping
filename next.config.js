const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-core',
      '@sparticuz/chromium-min',
    ]
  }
}

module.exports = nextConfig