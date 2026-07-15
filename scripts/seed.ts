import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = "";
async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("🚀 Starting seed...");

    // Run migration
    const migrationPath = path.join(__dirname, "../migrations/0001_init.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");
    await client.query(migrationSql);
    console.log("✅ Migration applied");

    // Clear existing data (idempotent)
    await client.query("DELETE FROM case_alerts");
    await client.query("DELETE FROM str_register");
    await client.query("DELETE FROM alerts");
    await client.query("DELETE FROM cases");
    await client.query("DELETE FROM transactions");
    await client.query("DELETE FROM accounts");
    await client.query("DELETE FROM customers");
    await client.query("DELETE FROM rules");
    await client.query("DELETE FROM audit_log");
    await client.query("DELETE FROM lib_suspicion_reason");
    await client.query("DELETE FROM lib_str_trigger");
    console.log("✅ Cleared existing data");

    // Seed lookups
    await seedLookups(client);
    console.log("✅ Lookups seeded");

    // Seed customers
    await seedCustomers(client);
    console.log("✅ Customers seeded");

    // Seed accounts
    await seedAccounts(client);
    console.log("✅ Accounts seeded");

    // Seed transactions
    await seedTransactions(client);
    console.log("✅ Transactions seeded");

    // Seed rules
    await seedRules(client);
    console.log("✅ Rules seeded");

    console.log("🎉 Seed complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

async function seedLookups(client: any) {
  const suspicionReasons = [
    ["SC1", "No underlying legal or trade obligation"],
    ["SC2", "Amount not commensurate with business or financial capacity"],
    ["SC3", "Deviates from profile of client"],
    ["SC4", "Structured to avoid being reported"],
    ["SC5", "Related to an unlawful activity"],
    ["SC6", "No apparent economic or visible lawful purpose"],
    ["PC1", "Kidnapping for ransom"],
    ["PC2", "Drug trafficking / RA 9165"],
    ["PC3", "Graft and corrupt practices"],
    ["PC4", "Plunder"],
    ["PC5", "Robbery and extortion"],
    ["PC6", "Jueteng and illegal gambling"],
    ["PC7", "Piracy"],
    ["PC8", "Qualified theft"],
    ["PC9", "Swindling (estafa)"],
    ["PC10", "Smuggling"],
    ["PC11", "Violations by public officers"],
    ["PC12", "Fraudulent practices under SRC"],
    ["PC13", "Felonies under foreign laws"],
    ["PC14", "Terrorism and conspiracy to commit terrorism"],
  ];

  for (const [value, name] of suspicionReasons) {
    await client.query(
      `INSERT INTO lib_suspicion_reason (value, name) VALUES ($1, $2)
       ON CONFLICT (value) DO NOTHING`,
      [value, name]
    );
  }

  const strTriggers = [
    ["A", "Covered transaction report"],
    ["B", "Suspicious transaction report"],
    ["C", "Electronic fund transfer"],
    ["D", "Cross-border wire transfer"],
    ["E", "Closed and denied accounts"],
    ["F", "Casino cash transaction report"],
    ["G", "Targeted financial sanctions"],
  ];

  for (const [value, name] of strTriggers) {
    await client.query(
      `INSERT INTO lib_str_trigger (value, name) VALUES ($1, $2)
       ON CONFLICT (value) DO NOTHING`,
      [value, name]
    );
  }
}

async function seedCustomers(client: any) {
  const customers = [
    ["CUST-010", "INDIVIDUAL", "Maria Santos Cruz", "1985-03-15", "PH", "Business Owner", "Business Income", "NORMAL"],
    ["CUST-011", "INDIVIDUAL", "Jose Reyes Garcia", "1978-11-22", "PH", "OFW", "Overseas Employment", "NORMAL"],
    ["CUST-012", "INDIVIDUAL", "Ana Dela Rosa Lim", "1990-06-08", "PH", "Freelancer", "Freelance Income", "NORMAL"],
    ["CUST-013", "INDIVIDUAL", "Roberto Tan Villanueva", "1995-01-30", "PH", "Student", "Allowance", "NORMAL"],
    ["CUST-014", "INDIVIDUAL", "Carmen Aquino Mendoza", "1982-09-14", "PH", "Government Employee", "Salary", "NORMAL"],
    ["CUST-015", "INDIVIDUAL", "Ricardo Bautista Flores", "1970-04-20", "PH", "Politician", "Public Office", "PEP"],
    ["CUST-016", "INDIVIDUAL", "Luisa Fernandez Ramos", "1988-12-05", "PH", "Real Estate Agent", "Commissions", "HIGH"],
    ["CUST-017", "INDIVIDUAL", "Eduardo Gonzales Santos", "1975-07-18", "PH", "Retired", "Pension", "NORMAL"],
    ["CUST-018", "INDIVIDUAL", "Patricia Morales Reyes", "1992-02-28", "PH", "Market Vendor", "Business Income", "NORMAL"],
    ["CUST-019", "INDIVIDUAL", "Miguel Torres Castillo", "1987-08-11", "PH", "IT Consultant", "Contract Work", "NORMAL"],
    ["CUST-020", "INDIVIDUAL", "Sophia Rivera Luna", "1998-05-25", "PH", "Call Center Agent", "Salary", "NORMAL"],
    ["CUST-021", "INDIVIDUAL", "Daniel Aguilar Cruz", "1993-10-03", "PH", "Driver", "Transport Income", "NORMAL"],
    ["CUST-022", "INDIVIDUAL", "Isabella Santos Tan", "1991-01-16", "PH", "Nurse", "Salary", "NORMAL"],
    ["CUST-023", "INDIVIDUAL", "Gabriel Reyes Lim", "1984-06-30", "PH", "Construction Worker", "Wages", "NORMAL"],
    ["CUST-024", "INDIVIDUAL", "Valentina Cruz Mendoza", "1996-11-12", "PH", "Online Seller", "E-commerce", "NORMAL"],
    ["CUST-025", "INDIVIDUAL", "Fernando Garcia Santos", "1980-03-22", "PH", "Businessman", "Business Income", "NORMAL"],
    ["CUST-026", "INDIVIDUAL", "Camille Dela Cruz", "1994-07-08", "PH", "BPO Manager", "Salary", "NORMAL"],
    ["CUST-027", "INDIVIDUAL", "Antonio Ramos Villa", "1972-12-01", "PH", "Retired Military", "Pension", "NORMAL"],
    ["CUST-028", "INDIVIDUAL", "Nicole Tan Reyes", "1999-04-17", "PH", "Student", "Allowance", "NORMAL"],
    ["CUST-029", "INDIVIDUAL", "Marco Villanueva Jr", "1997-09-05", "PH", "Rider/Delivery", "Gig Income", "NORMAL"],
    ["CUST-031", "INDIVIDUAL", "Elena Bautista Flores", "1986-02-14", "PH", "Unemployed", "None Declared", "HIGH"],
    ["CUST-032", "INDIVIDUAL", "Pedro Castillo Garcia", "1979-05-28", "PH", "Farmer", "Agricultural", "NORMAL"],
    ["CUST-033", "INDIVIDUAL", "Rosa Mendoza Aquino", "1990-08-19", "PH", "Housewife", "Spouse Income", "NORMAL"],
    ["CUST-034", "INDIVIDUAL", "Carlos Torres Rivera", "1983-11-07", "PH", "Seaman", "Overseas Employment", "NORMAL"],
    ["CORP-001", "CORPORATE", "Golden Dragon Trading Corp", null, "PH", null, "Trading", "HIGH"],
    ["CORP-002", "CORPORATE", "Sunshine Properties Inc", null, "PH", null, "Real Estate", "NORMAL"],
    ["CORP-003", "CORPORATE", "Pacific Logistics Solutions", null, "PH", null, "Logistics", "NORMAL"],
  ];

  for (const c of customers) {
    await client.query(
      `INSERT INTO customers (customer_id, customer_type, full_name, date_of_birth, nationality, occupation, source_of_funds, risk_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (customer_id) DO NOTHING`,
      c
    );
  }

  // Add counterparty customers (senders for fan-in)
  for (let i = 41; i <= 55; i++) {
    await client.query(
      `INSERT INTO customers (customer_id, customer_type, full_name, nationality, risk_rating)
       VALUES ($1, 'INDIVIDUAL', $2, 'PH', 'NORMAL')
       ON CONFLICT (customer_id) DO NOTHING`,
      [`CUST-0${i}`, `Counterparty ${i}`]
    );
  }
}

async function seedAccounts(client: any) {
  const accounts = [
    // Active accounts
    ["5500200001", "CUST-010", "CASA", "ACTIVE", "2022-01-10", "2026-07-01"],
    ["5500300001", "CUST-011", "CASA", "ACTIVE", "2021-05-20", "2026-07-01"],
    ["5500400001", "CUST-012", "CASA", "ACTIVE", "2023-03-15", "2026-07-01"],
    ["5500500001", "CUST-013", "CASA", "ACTIVE", "2024-01-05", "2026-07-01"],
    ["5500600001", "CUST-014", "CASA", "ACTIVE", "2020-08-12", "2026-07-01"],
    ["5500700001", "CUST-015", "CASA", "ACTIVE", "2019-11-01", "2026-07-01"],
    ["5500700002", "CUST-016", "CASA", "ACTIVE", "2022-06-20", "2026-07-01"],
    ["5500700003", "CUST-017", "CASA", "ACTIVE", "2018-04-10", "2026-07-01"],
    ["5500900001", "CUST-018", "CASA", "ACTIVE", "2023-09-01", "2026-07-01"],
    ["5501000001", "CUST-019", "CASA", "ACTIVE", "2022-02-14", "2026-07-01"],
    ["5501100001", "CUST-020", "CASA", "ACTIVE", "2024-06-01", "2026-07-01"],
    ["5501200001", "CUST-021", "CASA", "ACTIVE", "2023-01-15", "2026-07-01"],
    ["5501200002", "CUST-022", "CASA", "ACTIVE", "2022-11-20", "2026-07-01"],
    ["5501200003", "CUST-023", "CASA", "ACTIVE", "2021-07-05", "2026-07-01"],
    ["5501200004", "CUST-024", "CASA", "ACTIVE", "2024-02-28", "2026-07-01"],
    ["5501200005", "CUST-025", "CASA", "ACTIVE", "2020-10-10", "2026-07-01"],
    ["5501200006", "CUST-026", "CASA", "ACTIVE", "2023-05-15", "2026-07-01"],
    ["5501200007", "CUST-027", "CASA", "ACTIVE", "2019-03-20", "2026-07-01"],
    ["5501200008", "CUST-028", "CASA", "ACTIVE", "2024-08-01", "2026-07-01"],
    ["5501200009", "CUST-029", "CASA", "ACTIVE", "2024-04-10", "2026-07-01"],
    // Sleeper accounts (last activity > 6 months ago)
    ["8800100001", "CUST-031", "CASA", "ACTIVE", "2023-06-01", "2025-11-15"],
    ["8800100002", "CUST-032", "CASA", "ACTIVE", "2022-03-20", "2025-09-01"],
    ["8800100003", "CUST-033", "CASA", "ACTIVE", "2024-01-10", "2025-06-20"],
    ["8800100004", "CUST-034", "CASA", "ACTIVE", "2021-09-15", "2024-12-01"],
    // Corporate accounts
    ["7700800001", "CORP-001", "CASA", "ACTIVE", "2020-01-15", "2026-07-01"],
    ["7700800002", "CORP-002", "CASA", "ACTIVE", "2021-06-10", "2026-07-01"],
    ["7700800003", "CORP-003", "CASA", "ACTIVE", "2022-03-25", "2026-07-01"],
  ];

  for (const a of accounts) {
    await client.query(
      `INSERT INTO accounts (account_no, customer_id, account_type, status, opened_date, last_client_activity_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (account_no) DO NOTHING`,
      a
    );
  }
}

async function seedTransactions(client: any) {
  const txns: any[][] = [];

  // === Rule-triggering transactions ===

  // R1: Sleeper Account Sudden Credit (4 txns)
  txns.push(["CUST-031", "8800100001", "2026-07-10", "DEPOSIT", "C", 750000, "PHP", "MNL-01", "OTC", null, true, null, null, null]);
  txns.push(["CUST-032", "8800100002", "2026-07-11", "TRANSFER", "C", 1200000, "PHP", "MNL-02", "ONLINE", null, false, null, null, null]);
  txns.push(["CUST-033", "8800100003", "2026-07-12", "DEPOSIT", "C", 600000, "PHP", "MNL-03", "OTC", null, true, null, null, null]);
  txns.push(["CUST-034", "8800100004", "2026-07-09", "REMITTANCE", "C", 2500000, "PHP", "MNL-01", "OTC", null, false, null, null, "INWARD"]);

  // R2: Fan-in — 6 senders to CUST-010 (6 txns)
  const fanInSenders = ["CUST-041", "CUST-042", "CUST-043", "CUST-044", "CUST-045", "CUST-046"];
  const fanInAmounts = [200000, 250000, 180000, 220000, 200000, 150000];
  for (let i = 0; i < 6; i++) {
    txns.push(["CUST-010", "5500200001", `2026-07-${7 + i}`, "TRANSFER", "C", fanInAmounts[i], "PHP", "MNL-01", "ONLINE", null, false, fanInSenders[i], null, null]);
  }

  // R3: Fan-out — CUST-011 to 5 recipients (5 txns)
  const fanOutRecipients = ["CUST-051", "CUST-052", "CUST-053", "CUST-054", "CUST-055"];
  const fanOutAmounts = [300000, 250000, 200000, 150000, 250000];
  for (let i = 0; i < 5; i++) {
    txns.push(["CUST-011", "5500300001", `2026-07-${7 + i}`, "TRANSFER", "D", fanOutAmounts[i], "PHP", "MNL-02", "ONLINE", null, false, fanOutRecipients[i], null, null]);
  }

  // R4: High Frequency Credit — CUST-012 (16 txns)
  for (let i = 0; i < 16; i++) {
    const day = 7 + Math.floor(i / 3);
    const amount = 55000 + Math.floor(Math.random() * 30000);
    txns.push(["CUST-012", "5500400001", `2026-07-${day}`, "DEPOSIT", "C", amount, "PHP", "MNL-03", i % 2 === 0 ? "OTC" : "ONLINE", null, true, null, null, null]);
  }

  // R5: OSEC — CUST-013 (25 small inward remittances)
  for (let i = 0; i < 25; i++) {
    const day = 15 + Math.floor(i * 28 / 25);
    const dateStr = day <= 30 ? `2026-06-${String(day).padStart(2, "0")}` : `2026-07-${String(day - 30).padStart(2, "0")}`;
    const amount = 2000 + Math.floor(Math.random() * 2800);
    txns.push(["CUST-013", "5500500001", dateStr, "REMITTANCE", "C", amount, "PHP", null, "REMITTANCE", null, false, null, null, "INWARD"]);
  }

  // R6: ATM High Frequency — CUST-014 (8 withdrawals)
  for (let i = 0; i < 8; i++) {
    txns.push(["CUST-014", "5500600001", `2026-07-${7 + i}`, "WITHDRAWAL", "D", 20000, "PHP", null, "ATM", null, true, null, null, null]);
  }

  // R7: Large Single Credit Individual (3 txns)
  txns.push(["CUST-015", "5500700001", "2026-07-10", "DEPOSIT", "C", 4500000, "PHP", "MNL-01", "OTC", null, true, null, null, null]);
  txns.push(["CUST-016", "5500700002", "2026-07-11", "TRANSFER", "C", 7800000, "PHP", "MNL-02", "ONLINE", null, false, null, null, null]);
  txns.push(["CUST-017", "5500700003", "2026-07-12", "DEPOSIT", "C", 5000000, "PHP", "MNL-03", "OTC", null, true, null, null, null]);

  // R8: Large Single Credit Corporate (3 txns)
  txns.push(["CORP-001", "7700800001", "2026-07-09", "TRANSFER", "C", 12000000, "PHP", "MNL-01", "ONLINE", null, false, null, null, null]);
  txns.push(["CORP-002", "7700800002", "2026-07-11", "TRANSFER", "C", 15500000, "PHP", "MNL-02", "OTC", null, false, null, null, null]);
  txns.push(["CORP-003", "7700800003", "2026-07-13", "TRANSFER", "C", 10200000, "PHP", "MNL-03", "ONLINE", null, false, null, null, null]);

  // R9: Structuring — CUST-018 (3 sub-threshold cash deposits)
  txns.push(["CUST-018", "5500900001", "2026-07-07", "DEPOSIT", "C", 240000, "PHP", "MNL-01", "OTC", null, true, null, null, null]);
  txns.push(["CUST-018", "5500900001", "2026-07-08", "DEPOSIT", "C", 180000, "PHP", "MNL-01", "OTC", null, true, null, null, null]);
  txns.push(["CUST-018", "5500900001", "2026-07-09", "DEPOSIT", "C", 150000, "PHP", "MNL-01", "OTC", null, true, null, null, null]);

  // R10: Pass-Through — CUST-019 (credit then 90% debit)
  txns.push(["CUST-019", "5501000001", "2026-07-07", "TRANSFER", "C", 3000000, "PHP", "MNL-02", "ONLINE", null, false, null, null, null]);
  txns.push(["CUST-019", "5501000001", "2026-07-08", "TRANSFER", "D", 1500000, "PHP", "MNL-02", "ONLINE", null, false, null, null, null]);
  txns.push(["CUST-019", "5501000001", "2026-07-09", "TRANSFER", "D", 1200000, "PHP", "MNL-02", "ONLINE", null, false, null, null, null]);

  // R11: InstaPay Fraud — CUST-020 (18 InstaPay credits + 3 ATM withdrawals)
  for (let i = 0; i < 18; i++) {
    const day = 7 + Math.floor(i / 4);
    const amount = 30000 + Math.floor(Math.random() * 15000);
    txns.push(["CUST-020", "5501100001", `2026-07-${day}`, "TRANSFER", "C", amount, "PHP", null, "ONLINE", "INSTAPAY", false, null, null, null]);
  }
  txns.push(["CUST-020", "5501100001", "2026-07-10", "WITHDRAWAL", "D", 250000, "PHP", null, "ATM", null, true, null, null, null]);
  txns.push(["CUST-020", "5501100001", "2026-07-11", "WITHDRAWAL", "D", 200000, "PHP", null, "ATM", null, true, null, null, null]);
  txns.push(["CUST-020", "5501100001", "2026-07-12", "WITHDRAWAL", "D", 150000, "PHP", null, "ATM", null, true, null, null, null]);

  // === Normal (non-triggering) transactions — ~350 ===
  const normalCustomers = [
    { id: "CUST-021", acct: "5501200001" },
    { id: "CUST-022", acct: "5501200002" },
    { id: "CUST-023", acct: "5501200003" },
    { id: "CUST-024", acct: "5501200004" },
    { id: "CUST-025", acct: "5501200005" },
    { id: "CUST-026", acct: "5501200006" },
    { id: "CUST-027", acct: "5501200007" },
    { id: "CUST-028", acct: "5501200008" },
    { id: "CUST-029", acct: "5501200009" },
  ];

  const txnTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"];
  const channels = ["OTC", "ONLINE", "ATM"];

  for (const cust of normalCustomers) {
    // ~40 transactions per customer across the month
    for (let d = 1; d <= 28; d++) {
      // 1-2 txns per day randomly
      const numTxns = Math.random() > 0.6 ? 2 : 1;
      for (let t = 0; t < numTxns; t++) {
        const isSalary = d === 15 && t === 0;
        const amount = isSalary
          ? 25000 + Math.floor(Math.random() * 10000)
          : 500 + Math.floor(Math.random() * 15000);
        const drCr = isSalary || Math.random() > 0.5 ? "C" : "D";
        const txnType = isSalary ? "DEPOSIT" : txnTypes[Math.floor(Math.random() * txnTypes.length)];
        const channel = channels[Math.floor(Math.random() * channels.length)];

        txns.push([
          cust.id, cust.acct,
          `2026-07-${String(d).padStart(2, "0")}`,
          txnType, drCr, amount, "PHP",
          "MNL-01", channel, null,
          channel === "OTC" && drCr === "C",
          null, null, null,
        ]);
      }
    }
  }

  // Insert all transactions
  for (const t of txns) {
    await client.query(
      `INSERT INTO transactions (customer_id, account_no, txn_date, txn_type, dr_cr_flg, txn_amount, currency, branch_code, channel, sub_channel, is_cash, counterparty_id, counterparty_account, remittance_direction)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      t
    );
  }

  console.log(`  → Inserted ${txns.length} transactions`);
}

async function seedRules(client: any) {
  const rules = [
    ["Sleeper Account Sudden Credit", "Significant credit in accounts inactive 6+ months", "HIGH", "STR-01", "Mule accounts / Cyber Heist",
      JSON.stringify([{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"gt",left:"txn.amount",right:"500000"},{op:"gte",left:"account.days_since_last_activity",right:"180"}])],
    ["Multiple Senders Fan-in", ">=5 distinct senders, aggregate >=1M weekly", "HIGH", "STR-02", "Pyramiding / Ponzi / Investment Scams",
      JSON.stringify([{op:"gte",left:"window_sum(txn.amount, 7d)",right:"1000000"},{op:"gte",left:"distinct_count(txn.counterparty_id, 7d)",right:"5"},{op:"eq",left:"txn.dr_cr_flg",right:"C"}])],
    ["Single Account Fan-out", ">=5 distinct recipients, aggregate >=1M weekly", "MEDIUM", "STR-03", "Pyramiding / Ponzi / Investment Scams",
      JSON.stringify([{op:"gte",left:"window_sum(txn.amount, 7d)",right:"1000000"},{op:"gte",left:"distinct_count(txn.counterparty_id, 7d)",right:"5"},{op:"eq",left:"txn.dr_cr_flg",right:"D"}])],
    ["High Frequency Credit (Individual)", ">=15 credits each >=50K in a week", "HIGH", "STR-08", "Drug-related / Illegal Gambling / Fraud",
      JSON.stringify([{op:"gte",left:"txn.amount",right:"50000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"},{op:"gte",left:"window_count(txn, 7d)",right:"15"}])],
    ["OSEC Pattern", ">=20 small inward remittances <=5K monthly", "HIGH", "STR-10", "Online Sexual Exploitation of Children (OSEC)",
      JSON.stringify([{op:"lte",left:"txn.amount",right:"5000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.remittance_direction",right:"INWARD"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"},{op:"gte",left:"window_count(txn, 30d)",right:"20"}])],
    ["ATM High Frequency Withdrawal", "ATM debits aggregating >=150K weekly", "MEDIUM", "STR-11", "Fraud / ATM Skimming",
      JSON.stringify([{op:"eq",left:"txn.channel",right:"ATM"},{op:"eq",left:"txn.dr_cr_flg",right:"D"},{op:"gte",left:"window_sum(txn.amount, 7d)",right:"150000"}])],
    ["Large Single Credit (Individual)", "Single credit >=4M to individual", "HIGH", "STR-12", "Plunder / Graft & Corruption",
      JSON.stringify([{op:"gte",left:"txn.amount",right:"4000000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"}])],
    ["Large Single Credit (Corporate)", "Single credit >=10M to corporate", "MEDIUM", "STR-13", "Plunder / Graft & Corruption",
      JSON.stringify([{op:"gte",left:"txn.amount",right:"10000000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.customer_type",right:"CORPORATE"}])],
    ["Structuring of Credit Transactions", ">=2 cash credits each <500K aggregating >=500K weekly", "HIGH", "STR-19", "Drug-related / Illegal Gambling / Fraud",
      JSON.stringify([{op:"lt",left:"txn.amount",right:"500000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.is_cash",right:"true"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"},{op:"gte",left:"window_sum(txn.amount, 7d)",right:"500000"},{op:"gte",left:"window_count(txn, 7d)",right:"2"}])],
    ["Pass-Through (Individual)", "Credit >=2M with >=90% debited within 7 days", "HIGH", "STR-20", "Mule accounts / Drug-related / Fraud",
      JSON.stringify([{op:"gte",left:"txn.amount",right:"2000000"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"},{op:"gte",left:"window_debit_ratio(txn.amount, 7d)",right:"0.9"}])],
    ["InstaPay Fraud Pattern", "Inward InstaPay >=500K aggregate, >=90% withdrawn, >=15 credits weekly", "MEDIUM", "STR-22", "Mule accounts / Cyber crimes",
      JSON.stringify([{op:"eq",left:"txn.sub_channel",right:"INSTAPAY"},{op:"eq",left:"txn.dr_cr_flg",right:"C"},{op:"eq",left:"txn.customer_type",right:"INDIVIDUAL"},{op:"gte",left:"window_sum(txn.amount, 7d)",right:"500000"},{op:"gte",left:"window_count(txn, 7d)",right:"15"},{op:"gte",left:"window_debit_ratio(txn.amount, 7d)",right:"0.9"}])],
  ];

  for (const r of rules) {
    await client.query(
      `INSERT INTO rules (rule_name, description, risk_level, scenario_ref, target_case, rule_condition)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      r
    );
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
