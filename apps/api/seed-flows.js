const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: (process.env.POSTGRES_PASSWORD || 'Nov52002#').replace(/^"|"$/g, ''),
  database: process.env.POSTGRES_NAME || '247gbs-audit',
  ssl: process.env.POSTGRES_SSL === 'true',
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  // ============================================================
  // 1. SEED PRE-AUDIT TRIAGE FORMS
  // ============================================================
  console.log('\n--- Seeding Pre-Audit Triage Forms ---');

  const triageForms = [
    {
      title: 'Business Triage',
      description: 'Default pre-audit business triage flow.',
      slug: 'default-business-triage',
      isDefault: true,
      questions: [
        {
          text: 'What best describes your business model?',
          type: 'single_choice',
          description: 'This helps us understand your operating structure.',
          answers: [
            { text: 'B2B Services & Consultancy', sortOrder: 1 },
            { text: 'Retail & Consumer Goods', sortOrder: 2 },
            { text: 'Manufacturing & Distribution', sortOrder: 3 },
            { text: 'Hospitality & Leisure', sortOrder: 4 },
          ],
        },
        {
          text: 'Do you have spare capacity or unmonetized team hours?',
          type: 'single_choice',
          description: 'Assess if resources can be deployed more effectively.',
          answers: [
            { text: 'Yes, noticeable idle time (>25%)', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Moderate fluctuations seasonally', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'No, we are at or over maximum capacity', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Hospitality & Leisure Express Triage',
      description: 'Targeted triage intake for restaurants, venues, boutique hotels, and leisure operators.',
      slug: 'hospitality-express-triage',
      isDefault: false,
      questions: [
        {
          text: 'What is your average weekday table / room occupancy rate?',
          type: 'single_choice',
          description: 'Measures operational yield outside peak weekend windows.',
          answers: [
            { text: 'Under 40% (Significant empty capacity on weekdays)', sortOrder: 1 },
            { text: '40% - 70% (Acceptable but room for promotion)', sortOrder: 2 },
            { text: 'Over 70% (Consistently strong weekday volume)', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'Do you experience high perishable food or beverage inventory spoilage?',
          type: 'single_choice',
          description: 'Food and beverage cost variances directly impact net margin.',
          answers: [
            { text: 'Yes, monthly write-offs exceed 6% of F&B purchases', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Moderate, primarily on slow mid-week periods', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'Minimal, we utilize dynamic menu management', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'What is your most pressing operational pressure right now?',
          type: 'single_choice',
          description: 'Determines the right follow-up intervention.',
          answers: [
            { text: 'Labor cost inflation and staff shift churn', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Commercial utility and supplier price increases', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'Direct booking acquisition vs OTA commission drag', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Retail & E-Commerce Pre-Audit Triage',
      description: 'Specialized triage flow for multichannel retailers, direct-to-consumer brands, and wholesalers.',
      slug: 'retail-ecommerce-triage',
      isDefault: false,
      questions: [
        {
          text: 'How many months of stock cover do you currently hold across your warehouses?',
          type: 'single_choice',
          description: 'High stock cover ties up working capital and increases storage charges.',
          answers: [
            { text: 'More than 4 months of stock cover (High cash lock-up)', sortOrder: 1 },
            { text: '2 to 4 months of stock cover (Balanced)', sortOrder: 2 },
            { text: 'Under 2 months (Lean, agile supply chain)', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'What is your blended return and refund rate?',
          type: 'single_choice',
          description: 'High returns erode margin through reverse logistics and restocking costs.',
          answers: [
            { text: 'Over 25% return rate (Severe margin degradation)', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: '10% to 25% return rate (Standard industry range)', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'Under 10% return rate (Well-managed product satisfaction)', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'Are you discounting aging stock aggressively to generate cash?',
          type: 'single_choice',
          description: 'Frequent discounting damages brand equity and indicates forecasting issues.',
          answers: [
            { text: 'Yes, heavy discounting is required to clear inventory', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Only during standard end-of-season clearance periods', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'No, full margin realization across products', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Manufacturing & Supply Chain Intake Triage',
      description: 'Intake assessment for industrial production, logistics, fabrication, and assembly plants.',
      slug: 'manufacturing-supply-chain-triage',
      isDefault: false,
      questions: [
        {
          text: 'What percentage of scheduled production machine time is lost to unscheduled downtime?',
          type: 'single_choice',
          description: 'Unexpected equipment stoppages reduce throughput and inflate labor costs.',
          answers: [
            { text: 'More than 15% unscheduled downtime (Frequent stoppages)', sortOrder: 1 },
            { text: '5% to 15% unscheduled downtime (Occasional breakdown)', sortOrder: 2 },
            { text: 'Under 5% downtime (Predictive maintenance in place)', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'Are raw material shortages causing delivery schedule breaches with key clients?',
          type: 'single_choice',
          description: 'Assesses upstream vendor reliability and stock-out risks.',
          answers: [
            { text: 'Yes, recurrent delivery penalties and lost customer goodwill', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Sporadic delays but usually absorbed by overtime', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'No, strong vendor SLAs and secondary source agreements', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
        {
          text: 'Do you have real-time visibility into machine-level energy consumption?',
          type: 'single_choice',
          description: 'Identifies energy optimization and off-peak load shifting opportunities.',
          answers: [
            { text: 'No, energy is billed as general facility overhead', auditType: 'LONG_FORM', sortOrder: 1 },
            { text: 'Sub-metering on primary heavy machinery only', auditType: 'SHORT_FORM', sortOrder: 2 },
            { text: 'Full IoT telemetry tracking kilowatt-hour per batch unit', auditType: 'SHORT_FORM', sortOrder: 3 },
          ],
        },
      ],
    },
  ];

  for (const formDef of triageForms) {
    let form = (
      await client.query('SELECT * FROM triage_forms WHERE slug = $1 LIMIT 1', [formDef.slug])
    ).rows[0];

    if (!form) {
      const res = await client.query(
        `INSERT INTO triage_forms (title, description, slug, "isDefault", status, settings, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'published', '{}', NOW(), NOW()) RETURNING *`,
        [formDef.title, formDef.description, formDef.slug, formDef.isDefault]
      );
      form = res.rows[0];
      console.log(`Created Triage Form: "${form.title}" (${form.id})`);
    } else {
      console.log(`Existing Triage Form: "${form.title}" (${form.id})`);
    }

    // Insert questions if form has no questions
    const qCount = parseInt(
      (await client.query('SELECT count(*) FROM triage_questions WHERE "formId" = $1', [form.id])).rows[0].count,
      10
    );

    if (qCount === 0) {
      for (let i = 0; i < formDef.questions.length; i++) {
        const qDef = formDef.questions[i];
        const qRes = await client.query(
          `INSERT INTO triage_questions ("formId", text, type, description, "order", required, "isActive", config, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, true, true, '{}', NOW(), NOW()) RETURNING *`,
          [form.id, qDef.text, qDef.type, qDef.description, i + 1]
        );
        const question = qRes.rows[0];

        for (let j = 0; j < qDef.answers.length; j++) {
          const aDef = qDef.answers[j];
          await client.query(
            `INSERT INTO triage_answers ("questionId", text, "sortOrder", "auditType", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
            [question.id, aDef.text, aDef.sortOrder, aDef.auditType || null]
          );
        }
      }
      console.log(`  Added ${formDef.questions.length} questions to "${form.title}"`);
    }
  }

  // ============================================================
  // 2. SEED SHORT AUDITS (SHORT_FORM)
  // ============================================================
  console.log('\n--- Seeding Short Audit Templates ---');

  const shortAudits = [
    {
      title: 'Standard Short Audit',
      description: 'Fast, high-level business capacity & stock health audit.',
      slug: 'default-short-audit',
      isDefault: true,
      questions: [
        {
          text: 'What is your current estimated daily operating capacity utilization?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'Under 50% (High idle capacity)', scoreImpact: 3, sortOrder: 1 },
            { text: '50% - 75% (Moderate capacity)', scoreImpact: 2, sortOrder: 2 },
            { text: 'Over 75% (Near full capacity)', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Do you hold slow-moving or excess inventory?',
          category: 'EXCESS_STOCK',
          answers: [
            { text: 'Substantial excess stock (>20% of inventory)', scoreImpact: 3, sortOrder: 1 },
            { text: 'Some slow-moving items (5% - 20%)', scoreImpact: 2, sortOrder: 2 },
            { text: 'Minimal / well-balanced stock (<5%)', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'How quickly can your business scale production or service output without hiring?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'Immediately (>30% headroom)', scoreImpact: 1, sortOrder: 1 },
            { text: 'Within 2-4 weeks with minor retooling', scoreImpact: 2, sortOrder: 2 },
            { text: 'Already at physical bottleneck capacity', scoreImpact: 3, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Rapid Working Capital & Cashflow Audit',
      description: '10-minute diagnostic examining inventory drag, debtor collection periods, and cash burn rate.',
      slug: 'rapid-working-capital-audit',
      isDefault: false,
      questions: [
        {
          text: 'What is your average Days Sales Outstanding (DSO) for customer receivables?',
          category: 'FINANCE',
          answers: [
            { text: 'Under 30 days (Healthy cash conversion)', scoreImpact: 10, sortOrder: 1 },
            { text: '30 to 60 days (Industry average with minor delays)', scoreImpact: 6, sortOrder: 2 },
            { text: 'Over 60 days (Severe working capital cash lockup)', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'Do you have standby overdraft or credit facility headroom exceeding 3 months of OPEX?',
          category: 'FINANCE',
          answers: [
            { text: 'Strong liquidity buffer >3 months OPEX', scoreImpact: 10, sortOrder: 1 },
            { text: 'Tight headroom between 1 and 3 months OPEX', scoreImpact: 5, sortOrder: 2 },
            { text: 'Under 30 days cash or fully drawn credit lines', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'How frequently do you write off aged stock or obsolete inventory?',
          category: 'EXCESS_STOCK',
          answers: [
            { text: 'Rarely, less than 1% of inventory annually', scoreImpact: 10, sortOrder: 1 },
            { text: 'Annual cleanouts of 3% - 7% of stock', scoreImpact: 5, sortOrder: 2 },
            { text: 'Frequent write-offs exceeding 8% of annual inventory', scoreImpact: 1, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Idle Capacity & Resource Optimization Check',
      description: 'Quick assessment to identify unmonetized staff hours, empty floor space, and idle fleet/equipment.',
      slug: 'spare-capacity-optimization-check',
      isDefault: false,
      questions: [
        {
          text: 'Are billable or operational team members active more than 75% of scheduled shift hours?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'High utilization >80% consistently', scoreImpact: 10, sortOrder: 1 },
            { text: 'Moderate utilization 60% - 80%', scoreImpact: 6, sortOrder: 2 },
            { text: 'Significant idle downtime <60%', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'Do you possess physical facility space or warehousing that sits empty during off-peak times?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'No, space is optimized year-round', scoreImpact: 10, sortOrder: 1 },
            { text: '10% to 25% of floor space is underutilized', scoreImpact: 6, sortOrder: 2 },
            { text: 'Substantial empty or unleased space >25%', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'Could your existing delivery or service fleet support 25% more volume without additional capital?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'Yes, immediate spare vehicle and route bandwidth', scoreImpact: 10, sortOrder: 1 },
            { text: 'Marginally with route optimization software', scoreImpact: 6, sortOrder: 2 },
            { text: 'No, fleet is already strained at maximum capacity', scoreImpact: 4, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'SaaS & Digital Tech Stack Efficiency Audit',
      description: 'Review redundant software subscriptions, shadow IT tools, and manual dual-entry bottlenecks.',
      slug: 'digital-tech-stack-audit',
      isDefault: false,
      questions: [
        {
          text: 'How many software tools or SaaS subscriptions are actively audited for utilization?',
          category: 'TECHNOLOGY',
          answers: [
            { text: 'Centralized IT procurement with continuous license harvesting', scoreImpact: 10, sortOrder: 1 },
            { text: 'Annual department-level review of software bills', scoreImpact: 6, sortOrder: 2 },
            { text: 'No formal audit, numerous shadow subscriptions active', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'Are team members manually copy-pasting customer data between your CRM and ERP/accounting?',
          category: 'TECHNOLOGY',
          answers: [
            { text: 'Fully integrated automated sync via webhook or API', scoreImpact: 10, sortOrder: 1 },
            { text: 'Periodic manual export/import batch jobs', scoreImpact: 5, sortOrder: 2 },
            { text: 'Heavy manual dual-entry across disparate tools', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Do you track customer acquisition cost (CAC) and lifetime value (LTV) through an automated dashboard?',
          category: 'MARKETING',
          answers: [
            { text: 'Live automated multi-touch attribution reporting', scoreImpact: 10, sortOrder: 1 },
            { text: 'Monthly spreadsheet reconciliation of marketing spend', scoreImpact: 6, sortOrder: 2 },
            { text: 'Ad-hoc estimation with no unified attribution model', scoreImpact: 2, sortOrder: 3 },
          ],
        },
      ],
    },
  ];

  for (const formDef of shortAudits) {
    let form = (
      await client.query('SELECT * FROM audit_forms WHERE slug = $1 LIMIT 1', [formDef.slug])
    ).rows[0];

    if (!form) {
      const res = await client.query(
        `INSERT INTO audit_forms (title, description, "auditType", slug, "isDefault", status, settings, "createdAt", "updatedAt")
         VALUES ($1, $2, 'SHORT_FORM', $3, $4, 'published', '{}', NOW(), NOW()) RETURNING *`,
        [formDef.title, formDef.description, formDef.slug, formDef.isDefault]
      );
      form = res.rows[0];
      console.log(`Created Short Audit: "${form.title}" (${form.id})`);
    } else {
      console.log(`Existing Short Audit: "${form.title}" (${form.id})`);
    }

    const qCount = parseInt(
      (await client.query('SELECT count(*) FROM audit_form_questions WHERE "formId" = $1', [form.id])).rows[0].count,
      10
    );

    if (qCount === 0) {
      for (let i = 0; i < formDef.questions.length; i++) {
        const qDef = formDef.questions[i];
        const qRes = await client.query(
          `INSERT INTO audit_form_questions ("formId", text, type, category, "order", required, "isActive", config, "createdAt", "updatedAt")
           VALUES ($1, $2, 'single_choice', $3, $4, true, true, '{}', NOW(), NOW()) RETURNING *`,
          [form.id, qDef.text, qDef.category, i + 1]
        );
        const question = qRes.rows[0];

        for (let j = 0; j < qDef.answers.length; j++) {
          const aDef = qDef.answers[j];
          await client.query(
            `INSERT INTO audit_form_answers ("questionId", text, "scoreImpact", "sortOrder", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
            [question.id, aDef.text, aDef.scoreImpact, aDef.sortOrder]
          );
        }
      }
      console.log(`  Added ${formDef.questions.length} questions to "${form.title}"`);
    }
  }

  // ============================================================
  // 3. SEED LONG AUDITS (LONG_FORM)
  // ============================================================
  console.log('\n--- Seeding Long Audit Templates ---');

  const longAudits = [
    {
      title: 'Comprehensive Enterprise Audit',
      description: '30-minute deep-dive diagnostic covering governance, operational resilience, stock management, and financial runway.',
      slug: 'default-long-audit',
      isDefault: true,
      questions: [
        {
          text: 'How structured is your quarterly strategic capacity planning?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'Formal resource planning with automated scheduling software', scoreImpact: 10, sortOrder: 1 },
            { text: 'Department-level spreadsheets updated monthly', scoreImpact: 6, sortOrder: 2 },
            { text: 'Reactive, no structured capacity forecasting', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'What percentage of inventory is tracked via live automated warehouse management systems?',
          category: 'EXCESS_STOCK',
          answers: [
            { text: '100% barcode/RFID tracking with real-time sync', scoreImpact: 10, sortOrder: 1 },
            { text: 'Partial system tracking with periodic manual stock counts', scoreImpact: 6, sortOrder: 2 },
            { text: 'Manual ledger or spreadsheet tracking only', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'What is your net customer revenue retention rate (NRR) over the trailing 12 months?',
          category: 'CUSTOMERS',
          answers: [
            { text: 'Over 110% (Strong account expansion)', scoreImpact: 10, sortOrder: 1 },
            { text: '95% to 110% (Stable customer base)', scoreImpact: 7, sortOrder: 2 },
            { text: 'Under 95% (High client churn eroding revenue)', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'What is your gross operating profit margin after all direct fulfillment costs?',
          category: 'FINANCE',
          answers: [
            { text: 'Strong gross margin exceeding 50%', scoreImpact: 10, sortOrder: 1 },
            { text: 'Moderate margin between 25% and 50%', scoreImpact: 6, sortOrder: 2 },
            { text: 'Thin margin under 25% vulnerable to inflation', scoreImpact: 2, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Forensic Financial & Operational Deep-Dive Audit',
      description: 'In-depth forensic examination of margin erosion, cost allocation inaccuracies, and procurement compliance.',
      slug: 'forensic-financial-operational-audit',
      isDefault: false,
      questions: [
        {
          text: 'What is your historical variance between budgeted vs actual direct procurement costs?',
          category: 'FINANCE',
          answers: [
            { text: 'Variance tightly controlled under 3%', scoreImpact: 10, sortOrder: 1 },
            { text: '3% to 10% unexpected slippage on key materials', scoreImpact: 5, sortOrder: 2 },
            { text: 'Chronic budget overruns exceeding 10%', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Are supplier contract pricing terms and volume rebates audited against actual billed invoices?',
          category: 'FINANCE',
          answers: [
            { text: 'Automated continuous 3-way matching in ERP', scoreImpact: 10, sortOrder: 1 },
            { text: 'Annual external sampling by accounting team', scoreImpact: 6, sortOrder: 2 },
            { text: 'Manual spot-checks with no automated reconciliation', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'What is the overall equipment effectiveness (OEE) across core operational lines?',
          category: 'SPARE_CAPACITY',
          answers: [
            { text: 'Benchmark OEE exceeding 85%', scoreImpact: 10, sortOrder: 1 },
            { text: 'Acceptable range between 65% and 85%', scoreImpact: 6, sortOrder: 2 },
            { text: 'Poor throughput below 65% with high waste', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'How frequently are customer acquisition cost (CAC) payback periods audited by channel?',
          category: 'MARKETING',
          answers: [
            { text: 'Multi-touch attribution with CAC payback under 6 months', scoreImpact: 10, sortOrder: 1 },
            { text: 'Blended payback calculation between 6 and 12 months', scoreImpact: 6, sortOrder: 2 },
            { text: 'No channel-level payback tracking performed', scoreImpact: 1, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Supply Chain Resilience & Vendor Risk Audit',
      description: 'Examines single-source dependencies, logistics buffer stocks, tariff exposures, and vendor SLAs.',
      slug: 'supply-chain-vendor-risk-audit',
      isDefault: false,
      questions: [
        {
          text: 'What proportion of critical production inputs rely on a single sole-source supplier?',
          category: 'EXCESS_STOCK',
          answers: [
            { text: 'Zero, all key components have secondary qualified sources', scoreImpact: 10, sortOrder: 1 },
            { text: '1-2 items sole-sourced but with 6-month buffer stock', scoreImpact: 6, sortOrder: 2 },
            { text: 'Critical sole sources with no backup contracts', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'How accurate are your automated ERP demand forecasts compared to actual order fulfillments?',
          category: 'EXCESS_STOCK',
          answers: [
            { text: 'Consistently above 90% forecast precision', scoreImpact: 10, sortOrder: 1 },
            { text: '70% to 90% forecast accuracy', scoreImpact: 6, sortOrder: 2 },
            { text: 'Frequent bullwhip effect stock-outs and emergency orders', scoreImpact: 2, sortOrder: 3 },
          ],
        },
        {
          text: 'Do you maintain real-time telemetry into supplier shipment tracking and customs milestones?',
          category: 'TECHNOLOGY',
          answers: [
            { text: 'Integrated freight forwarding platform via EDI/API', scoreImpact: 10, sortOrder: 1 },
            { text: 'Email-based milestone updates from freight brokers', scoreImpact: 5, sortOrder: 2 },
            { text: 'No visibility until delivery arrives at dock', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Are foreign currency exchange rate risk hedge instruments utilized for overseas purchases?',
          category: 'FINANCE',
          answers: [
            { text: 'Active FX forward contracts hedging >75% of exposure', scoreImpact: 10, sortOrder: 1 },
            { text: 'Natural hedging via foreign currency revenue', scoreImpact: 6, sortOrder: 2 },
            { text: 'Complete spot rate exposure to currency swings', scoreImpact: 2, sortOrder: 3 },
          ],
        },
      ],
    },
    {
      title: 'Corporate Governance & Regulatory Compliance Audit',
      description: 'Examines internal statutory controls, labor standards, environmental compliance, and data security.',
      slug: 'corporate-governance-compliance-audit',
      isDefault: false,
      questions: [
        {
          text: 'Are employee access permissions to financial ledgers and banking credentials reviewed dynamically?',
          category: 'TECHNOLOGY',
          answers: [
            { text: 'Role-based access with automated offboarding & quarterly audit', scoreImpact: 10, sortOrder: 1 },
            { text: 'Semi-annual manual review by IT and finance', scoreImpact: 6, sortOrder: 2 },
            { text: 'Ad-hoc password management with shared logins', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Is there a formal whistleblower hotline and independent reporting procedure?',
          category: 'FINANCE',
          answers: [
            { text: 'Independent third-party hotline overseen by board', scoreImpact: 10, sortOrder: 1 },
            { text: 'Internal HR grievance procedure', scoreImpact: 5, sortOrder: 2 },
            { text: 'No confidential reporting mechanism exists', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'How frequently is customer data security and GDPR/CCPA regulatory compliance audited?',
          category: 'TECHNOLOGY',
          answers: [
            { text: 'Annual third-party SOC2 / ISO27001 audit certification', scoreImpact: 10, sortOrder: 1 },
            { text: 'Internal IT vulnerability scans and policy reviews', scoreImpact: 6, sortOrder: 2 },
            { text: 'No formal information security audit performed', scoreImpact: 1, sortOrder: 3 },
          ],
        },
        {
          text: 'Has the business undergone formal stress-testing against recessionary revenue drops >30%?',
          category: 'FINANCE',
          answers: [
            { text: 'Detailed multi-scenario financial model tested within 6 months', scoreImpact: 10, sortOrder: 1 },
            { text: 'Basic break-even sensitivity analysis', scoreImpact: 5, sortOrder: 2 },
            { text: 'No stress testing conducted', scoreImpact: 1, sortOrder: 3 },
          ],
        },
      ],
    },
  ];

  for (const formDef of longAudits) {
    let form = (
      await client.query('SELECT * FROM audit_forms WHERE slug = $1 LIMIT 1', [formDef.slug])
    ).rows[0];

    if (!form) {
      const res = await client.query(
        `INSERT INTO audit_forms (title, description, "auditType", slug, "isDefault", status, settings, "createdAt", "updatedAt")
         VALUES ($1, $2, 'LONG_FORM', $3, $4, 'published', '{}', NOW(), NOW()) RETURNING *`,
        [formDef.title, formDef.description, formDef.slug, formDef.isDefault]
      );
      form = res.rows[0];
      console.log(`Created Long Audit: "${form.title}" (${form.id})`);
    } else {
      console.log(`Existing Long Audit: "${form.title}" (${form.id})`);
    }

    const qCount = parseInt(
      (await client.query('SELECT count(*) FROM audit_form_questions WHERE "formId" = $1', [form.id])).rows[0].count,
      10
    );

    if (qCount === 0) {
      for (let i = 0; i < formDef.questions.length; i++) {
        const qDef = formDef.questions[i];
        const qRes = await client.query(
          `INSERT INTO audit_form_questions ("formId", text, type, category, "order", required, "isActive", config, "createdAt", "updatedAt")
           VALUES ($1, $2, 'single_choice', $3, $4, true, true, '{}', NOW(), NOW()) RETURNING *`,
          [form.id, qDef.text, qDef.category, i + 1]
        );
        const question = qRes.rows[0];

        for (let j = 0; j < qDef.answers.length; j++) {
          const aDef = qDef.answers[j];
          await client.query(
            `INSERT INTO audit_form_answers ("questionId", text, "scoreImpact", "sortOrder", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
            [question.id, aDef.text, aDef.scoreImpact, aDef.sortOrder]
          );
        }
      }
      console.log(`  Added ${formDef.questions.length} questions to "${form.title}"`);
    }
  }

  console.log('\n--- Seeding Complete Successfully! ---');
  await client.end();
}

main().catch((err) => {
  console.error('Seeding error:', err);
  client.end();
  process.exit(1);
});
