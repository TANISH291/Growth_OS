
"use strict";

/* =========================================
   GROWTHOS — DEMO DATA
   Replace this with FastAPI data later.
========================================= */

const transactions = [
  { id: "TXN-1001", name: "Rahul Shah", initials: "RS", date: "2026-10-02", method: "UPI", amount: 2450, status: "Completed" },
  { id: "TXN-1002", name: "Simran Patel", initials: "SP", date: "2026-10-02", method: "Card", amount: 1800, status: "Completed" },
  { id: "TXN-1003", name: "Arjun Kumar", initials: "AK", date: "2026-10-01", method: "UPI", amount: 3200, status: "Pending" },
  { id: "TXN-1004", name: "Priya Mehta", initials: "PM", date: "2026-10-01", method: "Cash", amount: 950, status: "Completed" },
  { id: "TXN-1005", name: "Aarav Desai", initials: "AD", date: "2026-09-30", method: "Card", amount: 4200, status: "Completed" },
  { id: "TXN-1006", name: "Neha Verma", initials: "NV", date: "2026-09-30", method: "UPI", amount: 1250, status: "Failed" },
  { id: "TXN-1007", name: "Rohan Joshi", initials: "RJ", date: "2026-09-29", method: "UPI", amount: 5600, status: "Completed" },
  { id: "TXN-1008", name: "Ananya Rao", initials: "AR", date: "2026-09-29", method: "Card", amount: 2100, status: "Completed" },
  { id: "TXN-1009", name: "Kabir Singh", initials: "KS", date: "2026-09-28", method: "Cash", amount: 780, status: "Pending" },
  { id: "TXN-1010", name: "Isha Kapoor", initials: "IK", date: "2026-09-27", method: "UPI", amount: 3650, status: "Completed" },
  { id: "TXN-1011", name: "Dev Malhotra", initials: "DM", date: "2026-09-26", method: "Card", amount: 1990, status: "Completed" },
  { id: "TXN-1012", name: "Meera Nair", initials: "MN", date: "2026-09-25", method: "UPI", amount: 2800, status: "Failed" }
];

const chartData = {
  "7d": {
    revenue: [24, 38, 32, 55, 46, 71, 63],
    transactions: [21, 35, 30, 49, 44, 66, 59],
    labels: ["Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 01", "Oct 02"],
    revenueTotal: "₹3.12L",
    transactionTotal: "1,920",
    customers: "710",
    aov: "₹1,625",
    period: "Last 7 days"
  },
  "30d": {
    revenue: [20, 32, 27, 44, 38, 58, 50, 66, 54, 75, 64, 85],
    transactions: [18, 28, 24, 38, 34, 49, 45, 59, 48, 68, 58, 78],
    labels: ["Sep 03", "Sep 06", "Sep 09", "Sep 12", "Sep 15", "Sep 18", "Sep 21", "Sep 24", "Sep 27", "Oct 02"],
    revenueTotal: "₹12.84L",
    transactionTotal: "8,492",
    customers: "2,340",
    aov: "₹1,513",
    period: "Last 30 days"
  },
  "90d": {
    revenue: [22, 31, 28, 42, 37, 51, 48, 63, 59, 74, 69, 88],
    transactions: [20, 27, 24, 37, 32, 45, 42, 57, 51, 65, 62, 79],
    labels: ["Jul 05", "Jul 14", "Jul 23", "Aug 01", "Aug 10", "Aug 19", "Aug 28", "Sep 06", "Sep 15", "Oct 02"],
    revenueTotal: "₹36.20L",
    transactionTotal: "24,680",
    customers: "6,420",
    aov: "₹1,467",
    period: "Last 90 days"
  }
};

/* =========================================
   DOM HELPERS
========================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}

/* =========================================
   DYNAMIC DATE
========================================= */

function updateDate() {
  const dateElement = $(".eyebrow", $("#view-dashboard"));
  if (!dateElement) return;

  const today = new Date();
  dateElement.textContent = today
    .toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric"
    })
    .toUpperCase();
}

/* =========================================
   PAGE NAVIGATION
========================================= */

const viewNames = {
  dashboard: "Overview",
  transactions: "Transactions",
  customers: "Customers",
  insights: "AI Insights",
  campaigns: "Campaigns",
  forecasting: "Forecasting",
  settings: "Settings"
};

function navigateTo(viewName) {
  if (!viewNames[viewName]) return;

  $$(".view-section").forEach((section) => {
    section.classList.toggle(
      "active",
      section.id === `view-${viewName}`
    );
  });

  $$(".nav-item").forEach((item) => {
    const isActive = item.dataset.view === viewName;
    item.classList.toggle("active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  $("#breadcrumbCurrent").textContent = viewNames[viewName];
  closeSidebar();

  if (viewName === "transactions") {
    renderTransactions();
  }
}

$$("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.view);
  });
});

$$("[data-view-link]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(element.dataset.viewLink);
  });
});

/* =========================================
   MOBILE SIDEBAR
========================================= */

const sidebar = $("#sidebar");
const sidebarOverlay = $("#sidebarOverlay");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
  $("#mobileMenu").setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
}

$("#mobileMenu").addEventListener("click", () => {
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarOverlay.addEventListener("click", closeSidebar);

/* =========================================
   DASHBOARD DATE RANGE
========================================= */

let currentRange = "30d";
let currentMetric = "revenue";

function updateDashboard(range) {
  const data = chartData[range];
  if (!data) return;

  currentRange = range;

  $$(".range-button").forEach((button) => {
    const active = button.dataset.range === range;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  $("#revenueValue").textContent = data.revenueTotal;
  $("#transactionsValue").textContent = data.transactionTotal;
  $("#customersValue").textContent = data.customers;
  $("#aovValue").textContent = data.aov;

  $("#chartRevenue").textContent =
    currentMetric === "revenue"
      ? data.revenueTotal
      : data.transactionTotal;

  $("#chartPeriod").textContent = data.period;

  renderChart();
}

$$(".range-button").forEach((button) => {
  button.addEventListener("click", () => {
    updateDashboard(button.dataset.range);
  });
});

/* =========================================
   SVG REVENUE CHART
========================================= */

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    name
  );

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

function renderChart() {
  const svg = $("#revenueChart");
  const line = $("#chartLine");
  const area = $("#chartArea");
  const pointsGroup = $("#chartPoints");
  const labelsElement = $("#chartLabels");

  if (!svg || !line || !area || !pointsGroup) return;

  const data = chartData[currentRange];
  const values = data[currentMetric];

  const width = 700;
  const height = 230;
  const left = 8;
  const right = 8;
  const top = 12;
  const bottom = 0;

  const maxValue = Math.max(...values) * 1.12;
  const minValue = 0;

  const coords = values.map((value, index) => {
    const x = left + index * (width - left - right) / (values.length - 1);
    const y = top + (1 - (value - minValue) / (maxValue - minValue))
      * (height - top - bottom);

    return { x, y };
  });

  const linePath = coords
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath =
    `${linePath} L ${coords[coords.length - 1].x} ${height} ` +
    `L ${coords[0].x} ${height} Z`;

  line.setAttribute("d", linePath);
  area.setAttribute("d", areaPath);

  pointsGroup.replaceChildren();

  const highlightIndex = coords.length - 1;
  const highlight = coords[highlightIndex];

  const circle = svgElement("circle", {
    cx: highlight.x,
    cy: highlight.y,
    r: 5,
    class: "chart-point"
  });

  pointsGroup.appendChild(circle);

  labelsElement.replaceChildren();

  const labelIndices = currentRange === "7d"
    ? [0, 1, 2, 3, 4, 5, 6]
    : [0, 2, 4, 6, 8, 9];

  labelIndices.forEach((index) => {
    const label = document.createElement("span");
    label.textContent = data.labels[index] || "";
    labelsElement.appendChild(label);
  });

  const yLabels = $$(".chart-y-labels span");
  const prefix = currentMetric === "revenue" ? "₹" : "";

  if (currentMetric === "revenue") {
    yLabels.forEach((label, index) => {
      const val = Math.round((maxValue * (3 - index) / 3));
      label.textContent = val >= 100
        ? `₹${Math.round(val / 100) / 10}k`
        : `₹${val}`;
    });
  } else {
    yLabels.forEach((label, index) => {
      const val = Math.round(maxValue * (3 - index) / 3);
      label.textContent = `${prefix}${val}`;
    });
  }
}

$("#chartMetricButton").addEventListener("click", () => {
  currentMetric = currentMetric === "revenue"
    ? "transactions"
    : "revenue";

  $("#chartMetricButton").innerHTML =
    `${currentMetric === "revenue" ? "Revenue" : "Transactions"} <span>⌄</span>`;

  renderChart();

  const data = chartData[currentRange];
  $("#chartRevenue").textContent =
    currentMetric === "revenue"
      ? data.revenueTotal
      : data.transactionTotal;
});

/* =========================================
   TRANSACTION TABLE
========================================= */

function createCell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function getInitialsColor(index) {
  const classes = [
    "avatar-teal",
    "avatar-purple",
    "avatar-orange",
    "avatar-blue"
  ];

  return classes[index % classes.length];
}

function renderTransactions() {
  const body = $("#transactionsBody");
  const search = ($("#transactionSearch")?.value || "")
    .trim()
    .toLowerCase();
  const status = $("#statusFilter")?.value || "all";

  const filtered = transactions.filter((transaction) => {
    const searchable = [
      transaction.id,
      transaction.name,
      transaction.method,
      transaction.status,
      transaction.date
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(search);
    const matchesStatus =
      status === "all" || transaction.status === status;

    return matchesSearch && matchesStatus;
  });

  body.replaceChildren();

  filtered.forEach((transaction) => {
    const row = document.createElement("tr");

    row.appendChild(createCell(transaction.id));

    const customerTd = document.createElement("td");
    const customerCell = document.createElement("div");
    customerCell.className = "customer-cell";

    const avatar = document.createElement("span");
    avatar.className = `table-avatar ${getInitialsColor(
      transactions.indexOf(transaction)
    )}`;
    avatar.textContent = transaction.initials;

    const customerText = document.createElement("span");
    const customerName = document.createElement("strong");
    customerName.textContent = transaction.name;

    customerText.appendChild(customerName);
    customerCell.append(avatar, customerText);
    customerTd.appendChild(customerCell);
    row.appendChild(customerTd);

    const date = new Date(`${transaction.date}T12:00:00`);
    row.appendChild(createCell(
      date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    ));

    row.appendChild(createCell(transaction.method));
    row.appendChild(createCell(formatINR(transaction.amount), "amount-cell"));

    const statusTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `status-badge ${
      transaction.status === "Completed"
        ? "status-success"
        : transaction.status === "Pending"
          ? "status-pending"
          : "status-failed"
    }`;
    badge.textContent = transaction.status;
    statusTd.appendChild(badge);
    row.appendChild(statusTd);

    body.appendChild(row);
  });

  $("#transactionCount").textContent =
    `Showing ${filtered.length} of ${transactions.length} sample transactions`;

  $("#emptyTransactions").hidden = filtered.length !== 0;
}

$("#transactionSearch").addEventListener("input", renderTransactions);
$("#statusFilter").addEventListener("change", renderTransactions);

/* =========================================
   CSV EXPORT
========================================= */

function exportCSV(records, filename) {
  if (!records.length) {
    showToast("There are no records to export.");
    return;
  }

  const headers = [
    "Transaction ID",
    "Customer",
    "Date",
    "Payment Method",
    "Amount INR",
    "Status"
  ];

  const rows = records.map((transaction) => [
    transaction.id,
    transaction.name,
    transaction.date,
    transaction.method,
    transaction.amount,
    transaction.status
  ]);

  const escapeCSV = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showToast("CSV report exported successfully.");
}

$("#exportButton").addEventListener("click", () => {
  exportCSV(transactions, "growthos-transactions.csv");
});

$("#transactionExport").addEventListener("click", () => {
  exportCSV(transactions, "growthos-transactions.csv");
});

/* =========================================
   CAMPAIGN MODAL
========================================= */

const modal = $("#campaignModal");
const campaignForm = $("#campaignForm");
let previousFocus = null;

function openCampaignModal() {
  previousFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("#campaignName").focus();
}

function closeCampaignModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  previousFocus?.focus();
}

$("#newCampaignButton").addEventListener("click", openCampaignModal);
$("#campaignCreateButton").addEventListener("click", openCampaignModal);
$("#closeModal").addEventListener("click", closeCampaignModal);
$("#cancelModal").addEventListener("click", closeCampaignModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeCampaignModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeCampaignModal();
  }
});

campaignForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#campaignName").value.trim();
  const type = $("#campaignType").value;
  const message = $("#campaignMessage").value.trim();

  if (!name) {
    $("#campaignName").focus();
    return;
  }

  const campaignRow = document.createElement("div");
  campaignRow.className = "campaign-row";

  const symbol = document.createElement("div");
  symbol.className = "campaign-symbol campaign-symbol-teal";
  symbol.textContent = "✦";

  const description = document.createElement("div");
  description.className = "campaign-description";

  const title = document.createElement("strong");
  title.textContent = name;

  const detail = document.createElement("span");
  detail.textContent = `${type} · Draft`;

  description.append(title, detail);

  const status = document.createElement("span");
  status.className = "campaign-status";
  status.textContent = "Draft";

  const review = document.createElement("button");
  review.className = "button button-secondary campaign-edit";
  review.type = "button";
  review.textContent = "Review";
  review.addEventListener("click", () => {
    showToast(message
      ? `Draft: ${name} — ${message}`
      : `Review campaign: ${name}`);
  });

  campaignRow.append(symbol, description, status, review);
  $("#campaignList").prepend(campaignRow);

  campaignForm.reset();
  closeCampaignModal();
  showToast("Campaign draft created locally.");
});

/* =========================================
   SETTINGS
========================================= */

$("#saveSettings").addEventListener("click", () => {
  const businessName = $("#businessName").value.trim();
  const adminName = $("#adminName").value.trim();

  if (!businessName || !adminName) {
    showToast("Please complete both profile fields.");
    return;
  }

  $(".workspace-info strong").textContent = businessName;
  $(".profile-info strong").textContent = adminName;
  showToast("Settings updated for this demo session.");
});

/* =========================================
   OTHER ACTIONS
========================================= */

$("#notificationButton").addEventListener("click", () => {
  showToast("You're all caught up!");
});

$("#upgradeButton").addEventListener("click", () => {
  showToast("Advanced features can be added in a future version.");
});

$("#profileButton").addEventListener("click", () => {
  navigateTo("settings");
});

/* =========================================
   INITIALIZATION
========================================= */

function initializeApp() {
  updateDate();
  updateDashboard("30d");
  renderTransactions();

  $$(".range-button").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.range === currentRange)
    );
  });

  $$(".nav-item").forEach((button) => {
    button.setAttribute(
      "aria-current",
      button.classList.contains("active") ? "page" : "false"
    );
  });

  $$(".campaign-edit").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Review this sample campaign before use.");
    });
  });
}

initializeApp();