const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-core',
      'puppeteer',
      '@sparticuz/chromium-min',  '@sparticuz/chromium',
    ]
  }
}

module.exports = nextConfig