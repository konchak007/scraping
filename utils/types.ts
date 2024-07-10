interface Services {
    [key: string]: string;
  }
  export interface Company {
    adress: string;
    linkedInLink: string;
    company_name: string;
    website: string;
    overview: string;
    services: Services[];
    result: Services;
    clientServices: Services[];
    industriesServices: Services[];
    metrics: Services;
    focusTab:{
      [key: string]: Services[]
    }
  }
  
 export interface ExelStructure {
    company_name: string;
    overview: string;
    min_project_size: string;
    avg_hourly_rate: string;
    employees: string;
    year_founded: string;
    avg_review_rating: string;
    rating: string;
    most_common_project_size: string;
    headquarter: string;
    website: string;
    clients_percent: string;
    industries_percent: string;
  }

  export interface CompanyG2 {
    description:string;
    company_name: string;
    website: string;
    rating:string;
    overview:string;
  }