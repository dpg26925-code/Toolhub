
INSERT INTO public.categories (slug, name, description, icon)
VALUES ('accounting', 'Accounting', 'Invoices, receipts, VAT, payroll, ROI, depreciation, mortgages and business calculators — 100% in-browser.', '🧾')
ON CONFLICT (slug) DO NOTHING;

WITH cat AS (SELECT id FROM public.categories WHERE slug = 'accounting')
INSERT INTO public.tools (slug, name, short_description, category_id, icon, is_featured, is_free, credit_cost, client_side)
SELECT v.slug, v.name, v.short_description, cat.id, v.icon, v.is_featured, v.is_free, 0, true
FROM cat, (VALUES
  ('invoice-generator','Invoice Generator','Create and download professional PDF invoices with tax, discount and custom currency.','🧾',true,true),
  ('receipt-generator','Receipt Generator','Design and print thermal-style PDF receipts for any sale — merchant, items, payment.','🧻',false,true),
  ('vat-calculator','VAT / Sales Tax Calculator','Add VAT, GST or sales tax to any subtotal with country presets.','％',true,true),
  ('vat-reverse-calculator','VAT Reverse Calculator','Extract the net amount and tax from a total that already includes VAT.','⇐％',false,true),
  ('discount-calculator','Discount Calculator','Compute final price, savings and effective discount for stacked promotions.','🏷',false,true),
  ('sales-margin-calculator','Sales Margin Calculator','Turn cost and price into margin, markup and profit — or reverse-engineer price from a target margin.','📊',false,true),
  ('markup-calculator','Markup Calculator','Price products from cost + markup %, or work backwards from a target profit.','＋％',false,true),
  ('business-break-even','Business Break-even Calculator','Break-even units, revenue and contribution margin with a live cost/revenue chart.','⚖️',true,true),
  ('salary-to-hourly','Salary → Hourly Converter','Convert annual salary to hourly, daily, weekly and monthly rates.','💼',false,true),
  ('hourly-to-salary','Hourly → Salary Converter','Turn any hourly rate into annual, monthly and weekly salary — or reverse from a target.','⏱💰',false,true),
  ('payroll-tax-calculator','Payroll Tax Calculator','Progressive tax breakdown, net salary and effective rate — US, UK and Vietnam brackets.','💵',true,true),
  ('overtime-calculator','Overtime Pay Calculator','Regular + overtime pay at 1.5x, 2x or any custom multiplier.','⏰',false,true),
  ('roi-calculator','ROI Calculator','ROI, annualised return and net profit for any investment or campaign.','📈',false,true),
  ('npv-calculator','NPV / IRR Calculator','Discount a series of cash flows, get NPV, approximate IRR and accept/reject signal.','🧮',false,true),
  ('depreciation-calculator','Depreciation Calculator','Year-by-year schedule using straight-line, double-declining or sum-of-years methods.','📉',false,true),
  ('loan-amortization','Loan Amortization Schedule','Full month-by-month table with extra payment impact and CSV download.','📅',true,true),
  ('loan-calculator','Loan Calculator','Monthly payment, total interest and principal/interest split for any loan.','🏦',false,true),
  ('mortgage-calculator','Mortgage Calculator','Full PITI + HOA monthly payment with tax, insurance and payment breakdown.','🏠',true,true),
  ('startup-cost-calculator','Startup Cost Calculator','Total startup budget, cost-by-category breakdown and 6-month cash reserve.','🚀',false,true),
  ('profit-margin-calculator','Profit Margin Calculator','Gross, operating and net margin from revenue, COGS and expenses — with industry benchmarks.','💹',false,true)
) AS v(slug, name, short_description, icon, is_featured, is_free)
ON CONFLICT (slug) DO NOTHING;
