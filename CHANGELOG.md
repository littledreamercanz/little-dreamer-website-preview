# Little Dreamer Ltd Website Versions

## v1.8.0 - Fintech visual refresh and mobile overlap fix

- Upgraded the homepage 3D finance scene with floating dashboard panels and animated data lines.
- Added a richer fintech-style visual system across the Tools landing page, PAYE calculator, Tax Client Deadline Tracker and Useful Resources page.
- Reworked tool interiors so input panels, filter bars, rules, summary tiles and tables use professional dashboard-style backgrounds instead of plain white blocks.
- Added controlled visual backgrounds to service, industry, FAQ and support cards while keeping the layout readable.
- Fixed mobile overlap on Useful Resources cards where category labels collided with resource titles.
- Standardised cache-busting asset versions across Chinese and English pages.
- Adopted `MAJOR.MINOR.PATCH` versioning from this release onward. Future small fixes can use `v1.8.1`; larger feature/page additions can use `v1.9.0`; major structural redesigns can use `v2.0.0`.
- Previous production version remains archived as `v1.7` for rollback.

## v1.7 - Useful resources hub

- Added a new Useful Resources page under `/useful-resources.html` and `/en/useful-resources.html`.
- Added the Useful Resources entry to the Chinese and English Tools pages.
- Added curated New Zealand, Australia, US and global reference links for tax, business registration, employment, statistics, exchange rates, market information and financial regulation.
- Added client-side search and category filters for faster access to resource links.
- Added reference-only disclaimers for external links, market data and exchange-rate information.
- Previous production version remains archived as `v1.6` for rollback.

## v1.6 - Tax client deadline tracker

- Added a new Tax Client Deadline Tracker under `/client-tax-deadline-tracker.html` and `/en/client-tax-deadline-tracker.html`.
- Added a downloadable Excel workbook template at `/assets/little-dreamer-tax-deadline-tracker.xlsx` with Dashboard, Clients, Obligations, Due Rules and Sources sheets.
- Added browser-based localStorage tracking for client GST, PAYE deductions, payday filing, income tax return, provisional tax and RWT / withholding obligations.
- Added default due date estimates for common IRD timing rules, plus manual due date override for tax agent EOT, myIR letters, negotiated dates and non-standard client settings.
- Added filtering by tax type, status and client search, summary cards, status updates, sample rows and CSV export.
- Added IRD source links and caution notes that myIR remains the source of truth.
- Previous production version remains archived as `v1.5` for rollback.

## v1.5 - Tools section and PAYE calculator

- Added a top-level `财务工具 / Tools` navigation item.
- Added a tools landing page in Chinese and English.
- Added a PAYE Net Pay Calculator with employee rows, gross-to-net, net-to-gross, M / M SL / ME / ME SL tax code options, KiwiSaver, employer KiwiSaver, ESCT, Total to IRD and CSV export.
- Previous production version remains archived as `v1.4` for rollback.

## v1.4 - Bilingual Chinese and English website

- Added a full English website under `/en/` with English homepage, services, pricing, credentials, contact and six individual service pages.
- Added language switch buttons in the top navigation: Chinese pages link to `EN`, and English pages link back to `中文`.
- Rewrote English content for New Zealand English-speaking clients rather than using direct word-for-word translation.
- Kept the Chinese website as the default version at the main domain.
- Updated static asset version numbers to reduce browser cache issues after deployment.
- Previous production version remains archived as `v1.3` for rollback.

## v1.3 - Market positioning and conversion content

- Added stronger trust signals: Xero Certified Advisor, MYOB Certified Advisor, CA ANZ, CPA Australia, registered IRD tax agent in New Zealand, and CFO / Finance Manager experience.
- Added industry sections for construction, FMCG retail and wholesale, professional services, IT and contractors, international companies opening in New Zealand, property, trusts, payroll and HR.
- Reworked pricing into one-off services, monthly accounting packages, and CFO / advisory services.
- Added NZ tax FAQ content covering GST registration, GST filing frequency, provisional tax, Xero cleanup, IRD letters and one-off service availability.
- Added anonymous example case studies and placeholder client testimonials for later replacement with approved real client comments.
- Added an inquiry form layout on the contact page. Google Form integration is pending.
- Replaced technical 3D section copy with business-focused financial dashboard messaging.

## v1.2 - Professional visual redesign

- Added premium accounting and CFO advisory imagery.
- Improved homepage hero, advisory visual style, service cards, 3D dashboard visuals, mobile layout and navigation.
- Published to GitHub Pages at `www.littledreamernzau.com`.

## v1.1 - Deployment setup

- Added GitHub Pages setup details, custom domain configuration notes and deployment target documentation.
- Added `CNAME` for `www.littledreamernzau.com`.

## v1.0 - Initial draft website

- Created the first multi-page Little Dreamer Ltd website.
- Included homepage, services, pricing, about, contact, and individual service pages.
- Added WeChat QR contact card, contact details, base 3D financial visual and initial service/pricing content.
