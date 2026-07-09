const PAYE_CONFIG = {
  "2025-26": {
    label: "2025-26",
    brackets: [
      { upTo: 15600, rate: 0.105 },
      { upTo: 53500, rate: 0.175 },
      { upTo: 78100, rate: 0.30 },
      { upTo: 180000, rate: 0.33 },
      { upTo: Infinity, rate: 0.39 }
    ],
    secondaryRates: {
      SB: 0.105,
      S: 0.175,
      SH: 0.30,
      ST: 0.33,
      SA: 0.39,
      ND: 0.45
    },
    accRate: 0.0167,
    accCap: 152790,
    studentLoanRate: 0.12,
    studentLoanThreshold: 24128,
    kiwiSaverRates: [0, 0.03, 0.04, 0.06, 0.08, 0.10]
  },
  "2026-27": {
    label: "2026-27 draft",
    brackets: [
      { upTo: 15600, rate: 0.105 },
      { upTo: 53500, rate: 0.175 },
      { upTo: 78100, rate: 0.30 },
      { upTo: 180000, rate: 0.33 },
      { upTo: Infinity, rate: 0.39 }
    ],
    secondaryRates: {
      SB: 0.105,
      S: 0.175,
      SH: 0.30,
      ST: 0.33,
      SA: 0.39,
      ND: 0.45
    },
    accRate: 0.0167,
    accCap: 152790,
    studentLoanRate: 0.12,
    studentLoanThreshold: 24128,
    kiwiSaverRates: [0, 0.035, 0.04, 0.06, 0.08, 0.10]
  }
};

const TAX_CODES = [
  { value: "M", label: "M - Primary income" },
  { value: "M SL", label: "M SL - Primary + student loan" },
  { value: "SB", label: "SB - Secondary 10.5%" },
  { value: "S", label: "S - Secondary 17.5%" },
  { value: "SH", label: "SH - Secondary 30%" },
  { value: "ST", label: "ST - Secondary 33%" },
  { value: "SA", label: "SA - Secondary 39%" },
  { value: "ND", label: "ND - No declaration 45%" }
];

const hasDocument = typeof document !== "undefined";
const rowsEl = hasDocument ? document.querySelector("#employeeRows") : null;
const taxYearEl = hasDocument ? document.querySelector("#taxYear") : null;
const calcModeEl = hasDocument ? document.querySelector("#calcMode") : null;
const payPeriodEl = hasDocument ? document.querySelector("#payPeriod") : null;

function money(value) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function numberValue(input) {
  return Number.parseFloat(String(input || "").replace(/,/g, "")) || 0;
}

function annualIncomeTax(annualGross, config) {
  let tax = 0;
  let previous = 0;
  for (const bracket of config.brackets) {
    const taxable = Math.max(0, Math.min(annualGross, bracket.upTo) - previous);
    tax += taxable * bracket.rate;
    previous = bracket.upTo;
    if (annualGross <= bracket.upTo) break;
  }
  return tax;
}

function accLevy(annualGross, config) {
  return Math.min(Math.max(annualGross, 0), config.accCap) * config.accRate;
}

function studentLoanDeduction(annualGross, config) {
  return Math.max(0, annualGross - config.studentLoanThreshold) * config.studentLoanRate;
}

function calculateFromGross(grossPerPeriod, options) {
  const periods = options.periods;
  const annualGross = grossPerPeriod * periods;
  const config = options.config;
  const baseCode = options.taxCode.replace(" SL", "");
  const isPrimary = baseCode === "M";
  const tax = isPrimary
    ? annualIncomeTax(annualGross, config)
    : annualGross * (config.secondaryRates[baseCode] ?? 0);
  const acc = accLevy(annualGross, config);
  const studentLoan = options.studentLoan ? studentLoanDeduction(annualGross, config) : 0;
  const kiwiSaver = grossPerPeriod * options.kiwiSaverRate;
  const payePerPeriod = (tax + acc + studentLoan) / periods;
  const net = grossPerPeriod - payePerPeriod - kiwiSaver;
  return {
    gross: grossPerPeriod,
    tax: tax / periods,
    acc: acc / periods,
    studentLoan: studentLoan / periods,
    paye: payePerPeriod,
    kiwiSaver,
    net
  };
}

function calculateFromNet(targetNet, options) {
  let low = 0;
  let high = Math.max(targetNet * 2.4, 1000);
  while (calculateFromGross(high, options).net < targetNet) {
    high *= 1.5;
    if (high > 1000000) break;
  }
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const result = calculateFromGross(mid, options);
    if (result.net < targetNet) low = mid;
    else high = mid;
  }
  return calculateFromGross(high, options);
}

function buildTaxCodeOptions(selected = "M") {
  return TAX_CODES.map((code) => `<option value="${code.value}" ${code.value === selected ? "selected" : ""}>${code.label}</option>`).join("");
}

function buildKiwiSaverOptions(selected = "0.03") {
  const config = PAYE_CONFIG[taxYearEl?.value || "2025-26"];
  return config.kiwiSaverRates.map((rate) => {
    const value = String(rate);
    const label = rate === 0 ? "0%" : `${(rate * 100).toFixed(rate === 0.035 ? 1 : 0)}%`;
    return `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`;
  }).join("");
}

function createRow(name = "") {
  const row = document.createElement("tr");
  row.className = "employee-row";
  row.innerHTML = `
    <td><input class="employee-name" type="text" value="${name}" aria-label="Employee name"></td>
    <td><input class="pay-amount" type="number" min="0" step="0.01" value="1200" aria-label="Pay amount"></td>
    <td><select class="tax-code" aria-label="Tax code">${buildTaxCodeOptions()}</select></td>
    <td><select class="kiwisaver-rate" aria-label="KiwiSaver rate">${buildKiwiSaverOptions()}</select></td>
    <td><input class="student-loan" type="checkbox" aria-label="Student loan"></td>
    <td class="result-gross">$0.00</td>
    <td class="result-paye">$0.00</td>
    <td class="result-kiwisaver">$0.00</td>
    <td class="result-net">$0.00</td>
    <td><button class="remove-row" type="button" aria-label="Remove employee">Remove</button></td>
  `;
  rowsEl.appendChild(row);
  wireRow(row);
  syncTaxCodeStudentLoan(row);
  recalculate();
}

function syncTaxCodeStudentLoan(row) {
  const taxCode = row.querySelector(".tax-code").value;
  const loan = row.querySelector(".student-loan");
  if (taxCode.includes("SL")) loan.checked = true;
}

function wireRow(row) {
  row.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.classList.contains("tax-code")) syncTaxCodeStudentLoan(row);
      recalculate();
    });
    input.addEventListener("change", () => {
      if (input.classList.contains("tax-code")) syncTaxCodeStudentLoan(row);
      recalculate();
    });
  });
  row.querySelector(".remove-row").addEventListener("click", () => {
    row.remove();
    recalculate();
  });
}

function refreshKiwiSaverOptions() {
  document.querySelectorAll(".kiwisaver-rate").forEach((select) => {
    const current = select.value;
    select.innerHTML = buildKiwiSaverOptions(current);
  });
}

function recalculate() {
  const config = PAYE_CONFIG[taxYearEl.value];
  const periods = Number(payPeriodEl.value);
  const mode = calcModeEl.value;
  const totals = { gross: 0, paye: 0, kiwiSaver: 0, net: 0 };
  document.querySelectorAll(".employee-row").forEach((row) => {
    const amount = numberValue(row.querySelector(".pay-amount").value);
    const taxCode = row.querySelector(".tax-code").value;
    const studentLoan = row.querySelector(".student-loan").checked || taxCode.includes("SL");
    const options = {
      config,
      periods,
      taxCode,
      studentLoan,
      kiwiSaverRate: Number(row.querySelector(".kiwisaver-rate").value)
    };
    const result = mode === "grossToNet"
      ? calculateFromGross(amount, options)
      : calculateFromNet(amount, options);
    row.querySelector(".result-gross").textContent = money(result.gross);
    row.querySelector(".result-paye").textContent = money(result.paye);
    row.querySelector(".result-kiwisaver").textContent = money(result.kiwiSaver);
    row.querySelector(".result-net").textContent = money(result.net);
    totals.gross += result.gross;
    totals.paye += result.paye;
    totals.kiwiSaver += result.kiwiSaver;
    totals.net += result.net;
  });
  document.querySelector("#totalGross").textContent = money(totals.gross);
  document.querySelector("#totalPaye").textContent = money(totals.paye);
  document.querySelector("#totalKiwiSaver").textContent = money(totals.kiwiSaver);
  document.querySelector("#totalNet").textContent = money(totals.net);
}

if (typeof window !== "undefined") {
  window.LD_PAYE = {
    PAYE_CONFIG,
    calculateFromGross,
    calculateFromNet,
    annualIncomeTax,
    accLevy,
    studentLoanDeduction
  };
}

if (hasDocument) {
  document.querySelector("#addEmployee").addEventListener("click", () => {
    createRow(`Employee ${document.querySelectorAll(".employee-row").length + 1}`);
  });

  [taxYearEl, calcModeEl, payPeriodEl].forEach((el) => {
    el.addEventListener("change", () => {
      if (el === taxYearEl) refreshKiwiSaverOptions();
      recalculate();
    });
  });

  createRow("Employee 1");
  createRow("Employee 2");
  createRow("Employee 3");
}
