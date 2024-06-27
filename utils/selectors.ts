export const clutch = {
  organizationList: '.directory-list',
  organizationLink: 'h3.company_info a[data-link_text="Profile Title"]',
   nextPage: '.page-item.next', 
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
