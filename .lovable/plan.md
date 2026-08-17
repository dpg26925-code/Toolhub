# Plan: Add TikTok Shop Fee Calculator (Brazil)

Implementing a specialized calculator for Brazilian TikTok Shop sellers with BRL formatting and category-specific fee logic.

## User Review Required
> [!IMPORTANT]
> - The tool will use 2024 Brazil TikTok Shop fee estimates (5-8% commission, 2% transaction, 2.5% processing).
> - A "Product Cost" field is added to calculate the net margin effectively.

## Proposed Changes

### Tool Implementation
- Create `src/tools/tiktok-shop-fee-calculator.tsx`:
    - Inputs: Price, Product Cost, Category (Moda, Beleza, etc.), Shipping, Discount, Withdrawal Method.
    - Real-time calculation using BRL locale (`pt-BR`).
    - Visual fee distribution using a Recharts pie chart.
    - Comparison of "With vs Without Free Shipping".
    - Copy result and disclaimer.

### Registry & Metadata
- Register `tiktok-shop-fee-calculator` in `src/tools/registry.ts`.
- Add tool metadata to `src/lib/tools-data.ts` under the `tiktok` category.

### SEO & Content
- Add Portuguese SEO content (About, FAQ, How-to) to `src/lib/tool-content.ts`.

## Technical Details
- **Language**: Portuguese (pt-BR).
- **Category Fees**:
    - Moda: 8%
    - Beleza: 7%
    - Eletrônicos: 6%
    - Casa: 5%
    - Outros: 5%
- **Fixed Fees**: Transaction (2%), Processing (2.5%).
- **Withdrawal**: PIX (R$ 0), TED (R$ 5), International (R$ 15).
- **Libraries**: `lucide-react` for icons, `recharts` for the pie chart.
