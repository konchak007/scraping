const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-core',
      'puppeteer','puppeteer-extra-plugin-anonymize-ua',
      '@sparticuz/chromium-min',  '@sparticuz/chromium','puppeteer-extra-plugin-recaptcha', 'puppeteer-extra','puppeteer-extra-plugin-stealth'
    ]
  }
}

module.exports = nextConfig