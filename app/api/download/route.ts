"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import * as XLSX from "xlsx-js-style";

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
      } = company;

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
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join("\n"),
        clients_percent: clientServices
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join("\n"),
        industries_percent: industriesServices
          .map((obj) => `${Object.keys(obj)[0]}: '${Object.values(obj)[0]}'`)
          .join("\n"),
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

function applyStyles(worksheet: XLSX.WorkSheet, data: ExelStructure[]) {
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { auto: 1 } },
      right: { style: "thin", color: { auto: 1 } },
      bottom: { style: "thin", color: { auto: 1 } },
      left: { style: "thin", color: { auto: 1 } },
    },
  };

  const dataStyle = {
    font: { color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "E9EBF5" } },
    alignment: { horizontal: "left", vertical: "top", wrapText: true },
    border: {
      top: { style: "thin", color: { auto: 1 } },
      right: { style: "thin", color: { auto: 1 } },
      bottom: { style: "thin", color: { auto: 1 } },
      left: { style: "thin", color: { auto: 1 } },
    },
  };

  // Apply header styles
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    worksheet[cellAddress].s = headerStyle;
  }

  // Apply data styles and calculate row heights
  const rowHeights = [20]; // Default height for header row
  for (let row = 1; row <= range.e.r; row++) {
    let maxLines = 1;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = dataStyle;
        const cellValue = String(worksheet[cellAddress].v);
        const lines = cellValue.split("\n").length;
        maxLines = Math.max(maxLines, lines);
      }
    }
    rowHeights[row] = calculateRowHeight(maxLines);
  }

  // Set row heights
  worksheet["!rows"] = rowHeights.map((height) => ({ hpt: height }));

  // Calculate and set dynamic column widths
  const columnWidths = calculateColumnWidths(data);
  worksheet["!cols"] = columnWidths;
}

function calculateColumnWidths(data: ExelStructure[]): { wch: number }[] {
  const columnWidths: { [key: string]: number } = {};

  // Initialize with header widths
  Object.keys(data[0]).forEach((key) => {
    columnWidths[key] = key.length;
  });

  // Calculate max width for each column
  data.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      const cellValue = String(value);
      const lines = cellValue.split("\n");
      const cellWidth = Math.max(...lines.map((line) => line.length));
      if (cellWidth > columnWidths[key]) {
        columnWidths[key] = cellWidth;
      }
    });
  });

  // Convert to XLSX column width format
  // Add some padding and set a maximum width
  return Object.values(columnWidths).map((width) => ({
    wch: Math.min(Math.max(width + 2, 10), 50),
  }));
}

function calculateRowHeight(lines: number): number {
  const LINE_HEIGHT = 15; // Approximate height of a text line in points
  const PADDING = 6; // Extra padding in points
  return Math.min(Math.max(lines * LINE_HEIGHT + PADDING, 20), 409); // Min 20, Max 409 (Excel's limit)
}
