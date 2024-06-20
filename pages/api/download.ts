import { NextApiRequest, NextApiResponse } from "next";
import { utils, write } from "xlsx";

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
}

interface ExelStructure {
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { data } = req.body;

    // Sample data
    const newdata: ExelStructure[] = data.map((company: Company) => {
      const {
        company_name,
        overview,
        result,
        metrics,
        website,
        clientServices,
        industriesServices,
        services,
      } = company;

      return {
        company_name,
        overview,
        min_project_size: result["Min. project size"],
        avg_hourly_rate: result["Avg. hourly rate"],
        employees: result["Employees"],
        year_founded: result["Founded"],
        avg_review_rating: metrics["Average Review Rating"],
        rating: metrics["Average Referral Rating"],
        most_common_project_size: metrics["Most Common Project Size"],
        headquarter: metrics["Total Reviews"],
        website,
        services_percent: services
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join(", "),
        clients_percent: clientServices
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join(", "),
        industries_percent: industriesServices
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join(", "),
      };
    });

    // Create a new workbook and worksheet
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(newdata);

    // Add the worksheet to the workbook
    utils.book_append_sheet(workbook, worksheet, "Clutch");

    // Generate the Excel file
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set the response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=scrapping.xlsx");

    // Send the Excel file as the response
    res.status(200).send(excelBuffer);

    // res.status(200).json({ message: 'File downloaded successfully' });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
