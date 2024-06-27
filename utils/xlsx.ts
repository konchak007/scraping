import * as XLSX from "xlsx-js-style";
import { ExelStructure } from "./types";

export function applyStyles(worksheet: XLSX.WorkSheet, data: ExelStructure[]) {
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
  
 export function calculateColumnWidths(data: ExelStructure[]): { wch: number }[] {
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
  
 export function calculateRowHeight(lines: number): number {
    const LINE_HEIGHT = 15; // Approximate height of a text line in points
    const PADDING = 6; // Extra padding in points
    return Math.min(Math.max(lines * LINE_HEIGHT + PADDING, 20), 409); // Min 20, Max 409 (Excel's limit)
  }
  