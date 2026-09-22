/**
 * Arabic Localization and Formatting Utilities
 */

/**
 */
export function formatCurrency(amount: number, currency: string = "SAR"): string {
  const formattedNumber = new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  return `${formattedNumber} ${currency === "" ? "" : currency}`;
}

/**
 * Format Date to localized Arabic format
 */
export function formatDate(
  dateInput: string | Date | number,
  formatStyle: "short" | "medium" | "long" | "relative" = "medium"
): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "-";

  if (formatStyle === "relative") {
    const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
    const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);

    if (Math.abs(diffInSeconds) < 60) return "الآن";
    if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), "minute");
    }
    if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), "hour");
    }
    return rtf.format(Math.floor(diffInSeconds / 86400), "day");
  }

  const options: Intl.DateTimeFormatOptions =
    formatStyle === "short"
      ? { year: "numeric", month: "numeric", day: "numeric" }
      : formatStyle === "long"
      ? { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
      : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("ar-SA", options).format(date);
}

/**
 * Format numbers in Arabic locale or standard compact format
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 40): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
