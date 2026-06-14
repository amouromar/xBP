import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { BloodPressureReading } from "@/types";
import { formatBp } from "@/utils/formatting";
import {
  endOfMonth,
  formatMonthLabel,
  startOfMonth,
} from "@/utils/periodStats";

const FONT_MODULE = require(
  "../assets/font/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf",
);

let cachedFontBase64: string | null | undefined;

/**
 * Lazy-loaded expo-print module
 * Prevents native crash during route evaluation
 */
let PrintModule: typeof import("expo-print") | null = null;

async function getPrintModule() {
  if (!PrintModule) {
    PrintModule = await import("expo-print");
  }
  return PrintModule;
}

export type PdfExportScope =
  | { type: "today" }
  | { type: "month" }
  | { type: "days"; dayKeys: string[] }
  | { type: "all" };

export function getDayKey(value: string | Date) {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDayKeyLabel(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getUniqueDayKeys(logs: BloodPressureReading[]) {
  const keys = new Set(logs.map((log) => getDayKey(log.createdAt)));
  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}

export function filterLogsByScope(
  logs: BloodPressureReading[],
  scope: PdfExportScope,
): BloodPressureReading[] {
  const sorted = [...logs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

  switch (scope.type) {
    case "all":
      return sorted;

    case "today": {
      const todayKey = getDayKey(new Date());
      return sorted.filter((log) => getDayKey(log.createdAt) === todayKey);
    }

    case "month": {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      return sorted.filter((log) => {
        const created = new Date(log.createdAt);
        return created >= start && created <= end;
      });
    }

    case "days": {
      const selected = new Set(scope.dayKeys);
      return sorted.filter((log) =>
        selected.has(getDayKey(log.createdAt)),
      );
    }

    default:
      return sorted;
  }
}

export function getScopeLabel(scope: PdfExportScope, count: number): string {
  switch (scope.type) {
    case "today":
      return `Today (${count} reading${count === 1 ? "" : "s"})`;

    case "month":
      return `${formatMonthLabel(new Date())} (${count} reading${
        count === 1 ? "" : "s"
      })`;

    case "days":
      return `${scope.dayKeys.length} day${
        scope.dayKeys.length === 1 ? "" : "s"
      } (${count} reading${count === 1 ? "" : "s"})`;

    case "all":
      return `All data (${count} reading${count === 1 ? "" : "s"})`;
  }
}

async function loadFontBase64(): Promise<string | null> {
  if (cachedFontBase64 !== undefined) {
    return cachedFontBase64;
  }

  try {
    const asset = Asset.fromModule(FONT_MODULE);
    await asset.downloadAsync();

    if (!asset.localUri) {
      cachedFontBase64 = null;
      return null;
    }

    cachedFontBase64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return cachedFontBase64;
  } catch {
    cachedFontBase64 = null;
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLogTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupLogsByDay(logs: BloodPressureReading[]) {
  const groups = new Map<string, BloodPressureReading[]>();

  for (const log of logs) {
    const key = getDayKey(log.createdAt);
    const existing = groups.get(key) ?? [];
    existing.push(log);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).sort(([a], [b]) =>
    b.localeCompare(a),
  );
}

export async function buildPdfHtml(
  logs: BloodPressureReading[],
  scopeLabel: string,
): Promise<string> {
  const fontBase64 = await loadFontBase64();

  const fontFace = fontBase64
    ? `@font-face {
        font-family: 'BricolageGrotesque';
        src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
        font-weight: 100 900;
      }`
    : "";

  const fontFamily = fontBase64
    ? "'BricolageGrotesque', -apple-system, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const grouped = groupLogsByDay(logs);

  const daySections = grouped
    .map(([dayKey, dayLogs]) => {
      const rows = dayLogs
        .map((log) => {
          const status = log.statusLabel
            ? `<div class="status">${escapeHtml(log.statusLabel)}</div>`
            : "";

          const recommendation = log.recommendation
            ? `<div class="recommendation">${escapeHtml(
                log.recommendation,
              )}</div>`
            : "";

          const points =
            log.pointsEarned && log.pointsEarned > 0
              ? `<span class="points">+${log.pointsEarned} pts</span>`
              : "";

          return `
            <div class="reading">
              <div class="reading-top">
                <span class="bp">${escapeHtml(
                  formatBp(log.systolic, log.diastolic),
                )}</span>
                <span class="meta">${log.pulse ?? "--"} bpm · ${escapeHtml(
                  formatLogTime(log.createdAt),
                )}</span>
              </div>
              ${status}
              ${recommendation}
              ${points}
            </div>
          `;
        })
        .join("");

      return `
        <section class="day-group">
          <h2>${escapeHtml(formatDayKeyLabel(dayKey))}</h2>
          ${rows}
        </section>
      `;
    })
    .join("");

  const bodyContent =
    logs.length > 0
      ? daySections
      : `<p class="empty">No readings found for this export.</p>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      ${fontFace}

      * { box-sizing: border-box; }

      body {
        font-family: ${fontFamily};
        background: #F8F8F8;
        color: #111111;
        margin: 0;
        padding: 32px;
      }

      .header {
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 2px solid #CF3A49;
      }

      h1 {
        margin: 0 0 6px;
        font-size: 28px;
        font-weight: 700;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #666666;
      }

      .day-group {
        margin-bottom: 24px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 13px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #CF3A49;
      }

      .reading {
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 10px;
      }

      .reading-top {
        display: flex;
        justify-content: space-between;
      }

      .bp {
        font-size: 22px;
        font-weight: 700;
        color: #CF3A49;
      }

      .meta {
        font-size: 12px;
        color: #666666;
      }

      .status {
        font-size: 15px;
        font-weight: 600;
        color: #EF4444;
      }

      .recommendation {
        font-size: 13px;
        color: #666666;
      }

      .points {
        display: inline-block;
        margin-top: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #22C55E;
      }

      .empty {
        color: #666666;
      }

      .footer {
        margin-top: 32px;
        font-size: 11px;
        color: #A1A1AA;
        text-align: center;
      }
    </style>
  </head>

  <body>
    <div class="header">
      <h1>xBP Blood Pressure Report</h1>
      <p class="subtitle">
        ${escapeHtml(scopeLabel)} · Generated ${escapeHtml(
          formatLogTime(new Date().toISOString()),
        )}
      </p>
    </div>

    ${bodyContent}

    <p class="footer">Exported from xBP</p>
  </body>
</html>`;
}

export async function exportLogsToPdf(
  logs: BloodPressureReading[],
  scope: PdfExportScope,
): Promise<{ success: boolean; error?: string }> {
  const filtered = filterLogsByScope(logs, scope);

  if (filtered.length === 0) {
    return {
      success: false,
      error: "No readings found for the selected range.",
    };
  }

  try {
    const scopeLabel = getScopeLabel(scope, filtered.length);
    const html = await buildPdfHtml(filtered, scopeLabel);

    const Print = await getPrintModule();

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: "com.adobe.pdf",
        mimeType: "application/pdf",
        dialogTitle: "Save or share your xBP report",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[pdfExport]", error);
    return {
      success: false,
      error: "Could not generate PDF.",
    };
  }
}