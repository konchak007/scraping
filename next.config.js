const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-core',
      '@sparticuz/chromium',
      'puppeteer'
    ]
  }
}

module.exports = nextConfig