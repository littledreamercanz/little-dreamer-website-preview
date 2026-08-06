const STORAGE_KEY = "littleDreamerTaxDeadlineTracker";

const hasDocument = typeof document !== "undefined";
const form = hasDocument ? document.querySelector("#deadlineForm") : null;
const rowsEl = hasDocument ? document.querySelector("#deadlineRows") : null;
const filterTax = hasDocument ? document.querySelector("#filterTax") : null;
const filterStatus = hasDocument ? document.querySelector("#filterStatus") : null;
const filterClient = hasDocument ? document.querySelector("#filterClient") : null;

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addWorkingDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added += 1;
  }
  return result;
}

function autoDueDate(item) {
  const base = parseDate(item.periodDate);
  if (!base) return "";
  const y = base.getFullYear();
  const m = base.getMonth();
  const d = base.getDate();
  if (item.taxType === "GST") {
    if (m === 2) return `${y}-05-07`;
    if (m === 10) return `${y + 1}-01-15`;
    return formatDate(new Date(y, m + 1, 28));
  }
  if (item.taxType === "PAYE deductions") {
    if (item.employerSize === "Large") {
      if (d <= 15) return formatDate(new Date(y, m, 20));
      if (m === 11) return `${y + 1}-01-15`;
      return formatDate(new Date(y, m + 1, 5));
    }
    return formatDate(new Date(y, m + 1, 20));
  }
  if (item.taxType === "Payday filing") return formatDate(addWorkingDays(base, 2));
  if (item.taxType === "Income tax return") {
    if (item.eot === "Yes") return `${y + 1}-03-31`;
    return `${y}-07-07`;
  }
  if (item.taxType === "Provisional tax") {
    if (item.instalment === "1") return `${y}-08-28`;
    if (item.instalment === "2") return `${y + 1}-01-15`;
    if (item.instalment === "3") return `${y + 1}-05-07`;
    return `${y}-08-28`;
  }
  if (item.taxType === "RWT / withholding") {
    if (item.frequency === "6-monthly" && m === 8) return `${y}-10-20`;
    if (item.frequency === "6-monthly" && m === 2) return `${y}-04-20`;
    return formatDate(new Date(y, m + 1, 20));
  }
  return "";
}

function finalDueDate(item) {
  return item.manualDueDate || item.autoDueDate || "";
}

function daysLeft(item) {
  const due = parseDate(finalDueDate(item));
  if (!due) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

function priority(item) {
  if (item.status === "Filed/Paid") return "Done";
  const days = daysLeft(item);
  if (days === "") return "Manual date needed";
  if (days < 0) return "Overdue";
  if (days <= 7) return "Next 7 days";
  if (days <= 30) return "Next 30 days";
  return "Later";
}

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function filteredItems() {
  const query = (filterClient.value || "").toLowerCase().trim();
  return loadItems().filter((item) => {
    const taxOk = !filterTax.value || item.taxType === filterTax.value;
    const statusOk = !filterStatus.value || item.status === filterStatus.value;
    const text = `${item.clientName} ${item.irdNumber} ${item.email} ${item.contactPerson}`.toLowerCase();
    return taxOk && statusOk && (!query || text.includes(query));
  }).sort((a, b) => (finalDueDate(a) || "9999-12-31").localeCompare(finalDueDate(b) || "9999-12-31"));
}

function updateSummary(items) {
  const clients = new Set(items.map((item) => item.irdNumber || item.clientName).filter(Boolean));
  const open = items.filter((item) => item.status !== "Filed/Paid");
  document.querySelector("#totalClients").textContent = clients.size;
  document.querySelector("#openItems").textContent = open.length;
  document.querySelector("#dueSeven").textContent = open.filter((item) => {
    const days = daysLeft(item);
    return days !== "" && days >= 0 && days <= 7;
  }).length;
  document.querySelector("#overdueItems").textContent = open.filter((item) => {
    const days = daysLeft(item);
    return days !== "" && days < 0;
  }).length;
}

function render() {
  const all = loadItems();
  const view = filteredItems();
  updateSummary(all);
  rowsEl.innerHTML = "";
  if (!view.length) {
    rowsEl.innerHTML = `<tr><td colspan="12" class="empty-row">No obligations yet. Add a client obligation or load sample rows.</td></tr>`;
    return;
  }
  view.forEach((item) => {
    const tr = document.createElement("tr");
    const days = daysLeft(item);
    const itemPriority = priority(item);
    tr.dataset.priority = itemPriority;
    tr.innerHTML = `
      <td><strong>${item.clientName}</strong><small>${item.entityType || ""}</small></td>
      <td>${item.irdNumber || ""}</td>
      <td>${item.taxType}</td>
      <td>${item.periodDate || ""}<small>${item.frequency || ""}${item.instalment ? ` · Instalment ${item.instalment}` : ""}</small></td>
      <td>${item.autoDueDate || ""}</td>
      <td>${item.manualDueDate || ""}</td>
      <td><strong>${finalDueDate(item)}</strong></td>
      <td>${days}</td>
      <td><span class="priority-pill">${itemPriority}</span></td>
      <td><select data-action="status" data-id="${item.id}"><option>Not started</option><option>Waiting on client</option><option>In progress</option><option>Ready to file/pay</option><option>Filed/Paid</option></select></td>
      <td>${item.contactPerson || ""}<small>${item.phone || ""} ${item.email || ""}</small></td>
      <td><button class="remove-row" data-action="delete" data-id="${item.id}" type="button">Remove</button></td>
    `;
    tr.querySelector("select").value = item.status;
    rowsEl.appendChild(tr);
  });
}

function itemFromForm() {
  const data = Object.fromEntries(new FormData(form).entries());
  const item = {
    id: `TD-${Date.now()}`,
    clientName: data.clientName.trim(),
    irdNumber: data.irdNumber.trim(),
    contactPerson: data.contactPerson.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    entityType: data.entityType,
    taxType: data.taxType,
    frequency: data.frequency,
    periodDate: data.periodDate,
    instalment: data.instalment,
    employerSize: data.employerSize,
    eot: data.eot,
    manualDueDate: data.manualDueDate,
    status: data.status,
    notes: data.notes.trim()
  };
  item.autoDueDate = autoDueDate(item);
  return item;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv() {
  const rows = [[
    "Client", "IRD number", "Contact", "Phone", "Email", "Entity type", "Tax type", "Frequency", "Period/payday", "Instalment", "Employer size", "EOT", "Auto due", "Manual due", "Final due", "Days left", "Priority", "Status", "Notes"
  ], ...filteredItems().map((item) => [
    item.clientName, item.irdNumber, item.contactPerson, item.phone, item.email, item.entityType, item.taxType, item.frequency, item.periodDate, item.instalment, item.employerSize, item.eot, item.autoDueDate, item.manualDueDate, finalDueDate(item), daysLeft(item), priority(item), item.status, item.notes
  ])];
  const blob = new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `little-dreamer-tax-deadline-tracker-${formatDate(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function loadSampleRows() {
  const sample = [
    { clientName: "Example Construction Ltd", irdNumber: "123-456-789", contactPerson: "Director", phone: "021 000 000", email: "client@example.co.nz", entityType: "Company", taxType: "GST", frequency: "2-monthly", periodDate: "2026-06-30", instalment: "", employerSize: "N/A", eot: "N/A", manualDueDate: "", status: "Waiting on client", notes: "Sample GST row" },
    { clientName: "Example Retail Ltd", irdNumber: "222-333-444", contactPerson: "Owner", phone: "", email: "", entityType: "Company", taxType: "PAYE deductions", frequency: "Monthly", periodDate: "2026-07-31", instalment: "", employerSize: "Small/medium", eot: "N/A", manualDueDate: "", status: "Not started", notes: "Sample PAYE row" },
    { clientName: "Example Rental Investor", irdNumber: "987-654-321", contactPerson: "Owner", phone: "", email: "", entityType: "Individual", taxType: "Income tax return", frequency: "Annual", periodDate: "2026-03-31", instalment: "", employerSize: "N/A", eot: "Yes", manualDueDate: "", status: "Not started", notes: "Sample EOT income tax row" }
  ].map((item) => ({ ...item, id: `TD-${Date.now()}-${Math.random().toString(16).slice(2)}`, autoDueDate: autoDueDate(item) }));
  saveItems([...loadItems(), ...sample]);
  render();
}

if (hasDocument) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const items = loadItems();
    items.push(itemFromForm());
    saveItems(items);
    form.reset();
    render();
  });
  [filterTax, filterStatus, filterClient].forEach((input) => input.addEventListener("input", render));
  document.querySelector("#exportCsv").addEventListener("click", exportCsv);
  document.querySelector("#loadSample").addEventListener("click", loadSampleRows);
  rowsEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='delete']");
    if (!button) return;
    saveItems(loadItems().filter((item) => item.id !== button.dataset.id));
    render();
  });
  rowsEl.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-action='status']");
    if (!select) return;
    const items = loadItems().map((item) => item.id === select.dataset.id ? { ...item, status: select.value } : item);
    saveItems(items);
    render();
  });
  render();
}
