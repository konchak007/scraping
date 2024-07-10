export const clutch = {
  organizationList: '.providers__list',
  organizationLink: 'h3.provider__title a[data-link_text="Profile Title"]',
   nextPage: '.sg-pagination-v2-next', 
  profile: {
    chartClients:'button[aria-label="Chart Clients"]',
    chartClientsActive:'button[aria-label="Chart Clients"].active',
    chartIndustries:'button[aria-label="Chart Industries"]',
    chartIndustriesActive:'button[aria-label="Chart Industries"].active',
    adress:'address.detailed-address',
    title: 'a[title="Provider Title"]',
    summaryText: '#profile-summary-text',
    summaryDetails:
      '.profile-summary__details  span.sg-text__title:not(.verification)',
    rewievRating: "#metrics_section div[name='metrics-average-review-rating']",
  },
};
