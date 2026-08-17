# Plan: Add Batch E-commerce Brazil Tools

Adding 7 new specialized e-commerce calculators for the Brazilian market, and organizing them alongside the existing TikTok Shop calculator.

## Proposed Changes

### Tool Implementation (Portuguese / BRL)
- Create `src/tools/br/calculadora-margem-lucro.tsx`: Profit margin, markup, and break-even.
- Create `src/tools/br/calculadora-frete-gratis.tsx`: Minimum price for free shipping and margin impact.
- Create `src/tools/br/calculadora-cupom-desconto.tsx`: Discount simulation and profit impact.
- Create `src/tools/br/calculadora-ponto-equilibrio.tsx`: Break-even point in units and revenue.
- Create `src/tools/br/calculadora-roi-marketing.tsx`: ROI, ROAS, and CPA calculation.
- Create `src/tools/br/calculadora-estoque-minimo.tsx`: Reorder point and safety stock.
- Create `src/tools/br/calculadora-preco-venda.tsx`: Suggested selling price based on costs and desired margin.
- Move `src/tools/tiktok-shop-fee-calculator.tsx` to `src/tools/br/tiktok-shop-fee-calculator.tsx` for consistency.

### Registry & Metadata
- Update `src/tools/registry.ts` to include the 8 Brazilian tools.
- Update `src/lib/tools-data.ts` with metadata for all 8 tools (category: `accounting` or `tiktok`).

### SEO & Content
- Update `src/lib/tool-content.ts` with detailed Portuguese About sections and FAQs for all 8 tools.

## Technical Details
- **Formatting**: All tools will use `pt-BR` locale for currency (`R$`) and numbers.
- **Charts**: Use `recharts` for visual breakdowns (Pie charts, Bar charts, Area charts).
- **UX**: Real-time calculations with clear input groups and result summaries.
- **Mobile**: Responsive layouts for all calculators.

## User Review Required
> [!IMPORTANT]
> - All tools will be entirely client-side (100% in-browser).
> - We will use the `accounting` category for most of these tools as it fits the business/finance nature of e-commerce calculations in this project.
