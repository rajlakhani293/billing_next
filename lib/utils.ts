import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import quarterOfYear from "dayjs/plugin/quarterOfYear"

dayjs.extend(quarterOfYear)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dateRanges = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "This Year",
  "Last Year",
  "Last 30 Days",
  "Last Quarter",
  // Add Financial Years dynamically or statically as needed
  "FY 2024-25",
  "FY 2023-24",
];


export const getDateRange = (range: string) => {
  const today = dayjs();
  let startDate = null;
  let endDate = null;

  switch (range) {
    case "Today":
      startDate = today.startOf("day").toDate();
      endDate = today.endOf("day").toDate();
      break;
    case "Yesterday":
      startDate = today.subtract(1, "day").startOf("day").toDate();
      endDate = today.subtract(1, "day").endOf("day").toDate();
      break;
    case "This Week":
      startDate = today.startOf("week").toDate();
      endDate = today.endOf("week").toDate();
      break;
    case "Last Week":
      startDate = today.subtract(1, "week").startOf("week").toDate();
      endDate = today.subtract(1, "week").endOf("week").toDate();
      break;
    case "This Month":
      startDate = today.startOf("month").toDate();
      endDate = today.endOf("month").toDate();
      break;
    case "Last Month":
      startDate = today.subtract(1, "month").startOf("month").toDate();
      endDate = today.subtract(1, "month").endOf("month").toDate();
      break;
    case "This Year":
      startDate = today.startOf("year").toDate();
      endDate = today.endOf("year").toDate();
      break;
    case "Last Year":
      startDate = today.subtract(1, "year").startOf("year").toDate();
      endDate = today.subtract(1, "year").endOf("year").toDate();
      break;
    case "Last 30 Days":
      startDate = today.subtract(30, "day").startOf("day").toDate();
      endDate = today.endOf("day").toDate();
      break;
    case "Last Quarter":
      startDate = today.subtract(1, "quarter").startOf("quarter").toDate();
      endDate = today.subtract(1, "quarter").endOf("quarter").toDate();
      break;
    // Add logic for FY years if needed
    default:
      if (range.startsWith("FY")) {
         // Logic for financial year
         // Assuming FY starts April 1st
         const years = range.replace("FY ", "").split("-");
         if (years.length === 2) {
             const startYear = parseInt(years[0]);
             // If year is 2 digits, assume 20xx
             const fullStartYear = startYear < 100 ? 2000 + startYear : startYear;
             const fullEndYear = fullStartYear + 1;
             startDate = dayjs(`${fullStartYear}-04-01`).startOf('day').toDate();
             endDate = dayjs(`${fullEndYear}-03-31`).endOf('day').toDate();
         }
      }
      break;
  }
  return { startDate, endDate };
};
