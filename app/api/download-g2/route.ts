"use server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";

import { applyStyles } from "../../../utils/xlsx";
import { CompanyG2, ExelStructure } from "../../../utils/types";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    // Sample data
    const newdata: ExelStructure[] = data.map((company: CompanyG2) => {
      const { company_name, overview, description, rating, website } = company;

      return {
        company_name,
        overview,
        description,
        rating,
        website,
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
