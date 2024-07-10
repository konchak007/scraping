"use server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";

import { applyStyles } from "../../../utils/xlsx";
import { Company, ExelStructure } from "../../../utils/types";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

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
        focusTab,
      } = company;

      const focusTabs = Object.keys(focusTab);
      return {
        company_name,
        overview,
        min_project_size: result["Min. project size"],
        avg_hourly_rate: result["Avg. hourly rate"],
        employees: result["Employees"],
        year_founded: result["Founded"].replace("Founded", ""),
        avg_review_rating: metrics["Average Review Rating"],
        rating: metrics["Average Referral Rating"],
        most_common_project_size: metrics["Most Common Project Size"],
        headquarter: metrics["Total Reviews"],
        website,
        services_percent: services
          ?.map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          ?.join("\n"),
        clients_percent: clientServices
          ?.map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          ?.join("\n"),
        industries_percent: industriesServices
          ?.map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          ?.join("\n"),
        focusTab: focusTabs
          ?.map((i) => {
            return `- ${i}:\n${focusTab[i]
              ?.map(
                (obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`,
              )
              ?.join("\n")}\n`;
          })
          ?.toString(),
      };
    });

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(newdata);

    // Apply styles to the worksheet
    applyStyles(worksheet, newdata);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clutch");

    // Generate the Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Set the response headers
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="data.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
  // res.status(200).json({ message: 'File downloaded successfully' });
}
