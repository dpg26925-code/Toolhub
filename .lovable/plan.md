# Plan: Implement Philippines 13th Month Pay Calculator

Implement a functional calculator for the Philippines 13th Month Pay according to BIR rules, with interactive charts, PDF export, and full SEO content.

## User Review Required

> [!IMPORTANT]
> - The tool will use ₱ (PHP) as the default currency symbol.
> - The calculation follows the standard Philippines prorated formula.
> - PDF export will use a client-side library (like `jspdf` or `html2canvas` if available, or simple `window.print`).

## Proposed Changes

### Tool Implementation (`src/tools/13th-month-pay-calculator.tsx`)
- Replace the placeholder UI with a comprehensive form for Philippines-specific logic.
- **Inputs**: Monthly salary, months worked, unpaid absences, allowances, and tax exemption threshold (default 300k).
- **Logic**:
  - Daily rate = Monthly basic / 22 working days.
  - Absence deduction = Daily rate × Unpaid days.
  - Gross 13th month = (Monthly basic + Allowances) × Months worked / 12.
  - Prorated = Gross - Absence deduction.
  - Taxable portion = Max(0, Prorated - Threshold).
  - Net amount = Prorated.
- **Visualization**: Add a breakdown bar chart using a simple CSS-based bar or a chart component if available (using standard Tailwind/Lucide).
- **Actions**: Add real-time calculation, "Copy Result", and "Print/Download PDF" (using `window.print` for reliability).

### Content & SEO (`src/lib/tool-content.ts` & `src/lib/tools-data.ts`)
- Update metadata in `tools-data.ts` (SEO title, meta description).
- Add unique content in `tool-content.ts`:
  - `longDescription`: Detailed explanation of BIR 13th month rules.
  - `howToUse`: Step-by-step instructions.
  - `faqs`: 4+ specific Q&A items regarding taxation and eligibility.

## Technical Details
- **Currency**: Unified ₱ symbol.
- **Precision**: 2 decimal places for currency results.
- **State Management**: React `useState` and `useMemo` for instant feedback.
- **Chart**: Custom component with color-coded bars for visual breakdown.
