import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, "$1");
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function publishPost() {
  const post = {
    slug: 'tiktok-shop-philippines-labor-costs',
    title: 'The Complete Guide to Philippines Labor Costs for TikTok Shop Sellers',
    excerpt: 'Calculate 13th month pay, SSS, Pag-IBIG, PhilHealth, and BIR withholding tax for your Philippines-based TikTok Shop team. Free calculators included.',
    content: `**TL;DR:** Running a TikTok Shop in the Philippines means hiring local staff — whether it's a virtual assistant for order processing, a creative for content, or a full operations team. But Philippines labor costs are more complex than just salary. Mandatory contributions, 13th month pay, taxes, and overtime premiums add 20-40% to your labor budget.

In this guide, we'll break down every component of Philippines labor costs and show you how to calculate them accurately.

---

## The True Cost of Hiring in the Philippines

When you offer a PHP 25,000 monthly salary, your actual cost is higher:

| Component | Employee Share | Employer Share | Total |
|---|---|---|---|
| Basic Salary | 25,000 | - | 25,000 |
| SSS | 1,125 | 1,125 | 2,250 |
| Pag-IBIG | 250 | 500 | 750 |
| PhilHealth | 687.50 | 687.50 | 1,375 |
| 13th Month Pay | - | 2,083 | 2,083 |
| **Total** | **27,062.50** | **4,395** | **31,457.50** |

Your actual cost is 26% above the base salary.

---

## 13th Month Pay

13th month pay is a mandatory benefit under Presidential Decree 851. It equals monthly basic salary × months worked ÷ 12, prorated for partial years.

**Key rules:**
- Must be paid before December 24
- PHP 300,000 tax-exempt threshold
- Includes basic salary + regular allowances
- Excludes bonuses, gifts, overtime

Use the [13th Month Pay Calculator](/tools/13th-month-pay-calculator) to compute exact amounts.

---

## SSS Contributions

SSS provides retirement, disability, and health benefits. Contribution rates vary by salary bracket:

| Salary Bracket | Employer | Employee | Total |
|---|---|---|---|
| PHP 5,000 | 500 | 200 | 700 |
| PHP 15,000 | 1,125 | 562.50 | 1,687.50 |
| PHP 25,000 | 1,125 | 1,125 | 2,250 |
| PHP 35,000 | 1,125 | 1,125 | 2,250 |

Use the [SSS Contribution Calculator](/tools/sss-calculator) for exact amounts.

---

## Pag-IBIG

Pag-IBIG provides housing loans and savings. Contributions are capped at PHP 200 each for employee and employer.

| Monthly Salary | Employee (1-2%) | Employer (2-3%) | Total |
|---|---|---|---|
| PHP 10,000 | 100 | 200 | 300 |
| PHP 20,000 | 200 | 200 | 400 |
| PHP 35,000 | 200 | 200 | 400 |

Use the [Pag-IBIG Calculator](/tools/pag-ibig-calculator) for details.

---

## PhilHealth

PhilHealth provides health insurance. Both employee and employer contribute 2.75% each, with a floor of PHP 275 and ceiling of PHP 5,500.

| Monthly Salary | Employee | Employer | Total |
|---|---|---|---|
| PHP 10,000 | 275 | 275 | 550 |
| PHP 25,000 | 687.50 | 687.50 | 1,375 |
| PHP 100,000 | 2,750 | 2,750 | 5,500 |

---

## BIR Withholding Tax

Income tax is progressive. The first PHP 250,000 is exempt:

| Annual Taxable Income | Rate |
|---|---|
| Below PHP 250,000 | 0% |
| PHP 250,001 - 400,000 | 15% of excess |
| PHP 400,001 - 800,000 | PHP 22,500 + 20% |
| PHP 800,001 - 2,000,000 | PHP 102,500 + 25% |

Use the [BIR Withholding Tax Calculator](/tools/bir-tax-calculator) for monthly tax estimates.

---

## Overtime and Premium Pay

Philippine labor law mandates premium pay for:
- **Rest days:** +30%
- **Special holidays:** +30% (if worked)
- **Regular holidays:** +100%
- **Night shift (10PM-6AM):** +10%

Use the [Overtime Calculator PH](/tools/overtime-calculator-ph) for exact computations.

---

## Total Labor Cost Calculator

To estimate your total labor cost:
1. Start with base salary
2. Add employee contributions (SSS, Pag-IBIG, PhilHealth)
3. Add employer contributions (same as above)
4. Add 13th month pay (monthly salary ÷ 12)
5. Add estimated tax withholding
6. Add overtime/holiday premiums if applicable

---

## Case Study: TikTok Shop Operations Manager

**Scenario:** Hire an operations manager at PHP 35,000/month.

**Cost breakdown:**
- Base salary: PHP 35,000
- SSS: PHP 2,250 (employer)
- Pag-IBIG: PHP 200 (employer)
- PhilHealth: PHP 962.50 (employer)
- 13th month: PHP 2,917/month equivalent
- **Total monthly cost: PHP 41,330**
- **Markup:** 18% above base salary

---

## FAQ

**Q: Is 13th month pay taxable?**
A: The first PHP 300,000 is tax-exempt. Amounts above are subject to withholding tax.

**Q: What if I hire someone mid-year?**
A: 13th month pay is prorated based on months worked.

**Q: Do I need to register for SSS, Pag-IBIG, and PhilHealth?**
A: Yes, as an employer, you must register and contribute for all regular employees.

**Q: How do I compute overtime for holidays?**
A: Regular holidays pay 200% of daily rate. If the holiday falls on a rest day, it's 260%.

**Q: What's the minimum wage in the Philippines?**
A: It varies by region. Check DOLE's current rates for your area.

---

## Conclusion

Understanding Philippines labor costs is essential for long-term TikTok Shop success. By accounting for all mandatory benefits and taxes, you can build a sustainable team while staying compliant with local laws.

Use our suite of [Philippines HR Tools](/category/philippines) to simplify your payroll calculations today.

---

## Related Tools

- [13th Month Pay Calculator](/tools/13th-month-pay-calculator)
- [SSS Contribution Calculator](/tools/sss-calculator)
- [Pag-IBIG Calculator](/tools/pag-ibig-calculator)
- [BIR Withholding Tax Calculator](/tools/bir-tax-calculator)
- [Overtime Calculator PH](/tools/overtime-calculator-ph)
`,
    meta_title: 'The Complete Guide to Philippines Labor Costs for TikTok Shop Sellers',
    meta_description: 'Calculate 13th month pay, SSS, Pag-IBIG, PhilHealth, and BIR withholding tax for your Philippines-based TikTok Shop team. Free calculators included.',
    published: true,
    published_at: new Date('2026-08-22T15:10:02.000Z').toISOString(),
    category: 'Business'
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(post, { onConflict: 'slug' });

  if (error) {
    console.error("Error upserting post:", error);
    process.exit(1);
  }

  console.log("Post published successfully!");
}

publishPost();
