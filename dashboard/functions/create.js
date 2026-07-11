import slipHeaderImage from "../../assets/slip_header.png";

const SAMPLE_PAYSLIP = {
  periodCovered: "September 25 - October 8, 2025",
  employeeName: "Madonza, Ricson Jay E.",
  designation: "Project Technical Staff I",
  basicPay: "19,347.00",
  adjustment: "-",
  absencesLates: "-",
  withholdingTax: "967.35",
  philhealth: "1,612.25",
  pagibigPremium: "400.00",
  pagibigMp2: "-",
  pagibigMpl: "-",
  totalDeductions: "2,979.60",
  netPay: "16,367.40",
  paymentPeriod: "September 25 - October 8, 2025",
  preparedBy: "Maria Carmeli Silva",
  preparedByRole: "Support Staff",
  checkedBy: "Neahlyn M. Mabiling",
  checkedByRole: "Accountant II",
  notedBy: "Dr. Freddie B. Bulauan",
  notedByRole: "Chief Administrative Officer",
};

let cachedHeaderDataUrl = "";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to convert blob to data URL."));
    reader.readAsDataURL(blob);
  });
}

async function resolveHeaderImageSource() {
  if (cachedHeaderDataUrl) return cachedHeaderDataUrl;

  try {
    const response = await fetch(slipHeaderImage);
    if (!response.ok) return slipHeaderImage;
    const imageBlob = await response.blob();
    cachedHeaderDataUrl = await blobToDataUrl(imageBlob);
    return cachedHeaderDataUrl;
  } catch {
    return slipHeaderImage;
  }
}

function createPayslipMarkup(data, headerSource) {
  return `
    <article class="print-slip">
      <div class="print-slip-header-wrap">
        <img src="${headerSource}" class="print-slip-header" alt="Payslip header" />
      </div>
      <p class="print-slip-subtitle">Payslip for Contract of Service</p>

      <div class="print-row print-row-two">
        <span class="print-label">Period Covered:</span>
        <span class="print-value">${data.periodCovered}</span>
      </div>

      <div class="print-row print-row-two">
        <span class="print-label">Name:</span>
        <span class="print-value print-value-strong">${data.employeeName}</span>
      </div>

      <div class="print-row print-row-two">
        <span class="print-label">Designation:</span>
        <span class="print-value">${data.designation}</span>
      </div>

      <div class="print-block-gap"></div>

      <div class="print-row print-row-three print-row-section print-row-major">
        <span class="print-section-title">Basic Pay:</span>
        <span class="print-currency">Php</span>
        <span class="print-amount">${data.basicPay}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Adjustment:</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.adjustment}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Absences/Lates:</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.absencesLates}</span>
      </div>

      <div class="print-row print-row-three print-row-section print-row-major">
        <span class="print-section-title">Gross Pay:</span>
        <span class="print-currency">Php</span>
        <span class="print-amount">${data.basicPay}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Less: Withholding Tax</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.withholdingTax}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Philhealth Premium</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.philhealth}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Pag-IBIG Premium</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.pagibigPremium}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Pag-IBIG MP2</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.pagibigMp2}</span>
      </div>

      <div class="print-row print-row-three">
        <span class="print-sub-label">Pag-IBIG MPL</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.pagibigMpl}</span>
      </div>

      <div class="print-row print-row-three print-row-section print-row-major">
        <span class="print-section-title">Total Deductions:</span>
        <span class="print-currency">Php</span>
        <span class="print-amount">${data.totalDeductions}</span>
      </div>

      <div class="print-row print-row-three print-row-section print-row-net">
        <span class="print-section-title print-section-title-indented">Net Pay:</span>
        <span class="print-currency">Php</span>
        <span class="print-amount">${data.netPay}</span>
      </div>

      <div class="print-row print-row-three print-row-section print-row-payment-title print-row-major">
        <span class="print-section-title">Payments:</span>
        <span></span>
        <span></span>
      </div>

      <div class="print-row print-row-three print-row-payment">
        <span class="print-sub-label print-sub-label-payment">${data.paymentPeriod}</span>
        <span class="print-currency"></span>
        <span class="print-amount">${data.netPay}</span>
      </div>

      <div class="print-row print-row-three print-row-section print-row-major">
        <span class="print-section-title print-section-title-indented">Total Payment:</span>
        <span class="print-currency">Php</span>
        <span class="print-amount">${data.netPay}</span>
      </div>

      <div class="print-signatures">
        <div class="print-signature-item">
          <span class="print-sign-label">Prepared By:</span>
          <span class="print-sign-write-line" aria-hidden="true"></span>
          <span class="print-sign-name">${data.preparedBy}</span>
          <span class="print-sign-role">${data.preparedByRole}</span>
        </div>

        <div class="print-signature-item">
          <span class="print-sign-label">Checked By:</span>
          <span class="print-sign-write-line" aria-hidden="true"></span>
          <span class="print-sign-name">${data.checkedBy}</span>
          <span class="print-sign-role">${data.checkedByRole}</span>
        </div>

        <div class="print-signature-item">
          <span class="print-sign-label">Noted By:</span>
          <span class="print-sign-write-line" aria-hidden="true"></span>
          <span class="print-sign-name">${data.notedBy}</span>
          <span class="print-sign-role">${data.notedByRole}</span>
        </div>
      </div>
    </article>
  `;
}

function buildPrintDocument(headerSource) {
  const slips = Array.from({ length: 3 }, () => createPayslipMarkup(SAMPLE_PAYSLIP, headerSource)).join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payslip Print Sample</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f5f7fb;
      color: #141414;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .print-sheet {
      width: 297mm;
      height: 210mm;
      background: #ffffff;
      padding: 6mm;
      border: 1px solid #d6dae5;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: 1fr;
      gap: 0.7in;
      align-items: start;
    }

    .print-slip {
      border-radius: 0;
      padding: 2.6mm 6.4mm 2.6mm 3.2mm;
      display: flex;
      flex-direction: column;
      height: fit-content;
      font-size: 2.2mm;
      line-height: 1.18;
      break-inside: avoid;
      position: relative;
      overflow: hidden;
    }

    .print-slip::after {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid #000000;
      pointer-events: none;
      z-index: 5;
    }

    .print-slip > * {
      position: relative;
      z-index: 1;
    }

    .print-slip-header-wrap {
      width: 100%;
      overflow: hidden;
      margin-top: -1.3mm;
      margin-left: -0.5mm;
      margin-right: -0.5mm;
      margin-bottom: 0.9mm;
    }

    .print-slip-header {
      width: 112%;
      height: auto;
      object-fit: cover;
      display: block;
      transform: translateX(-6%);
    }

    .print-slip-subtitle {
      margin: 0;
      text-align: center;
      font-size: 2.15mm;
      font-style: normal;
      font-weight: 700;
      white-space: nowrap;
      margin-bottom: 0.21in;
    }

    .print-row {
      display: grid;
      align-items: baseline;
      gap: 0.9mm;
      margin: 0.2mm 0;
    }

    .print-row-two {
      grid-template-columns: 30% 1fr;
    }

    .print-row-three {
      grid-template-columns: 58% 12% 30%;
      align-items: end;
    }

    .print-row-payment {
      grid-template-columns: 58% 12% 30%;
    }

    .print-row-payment-title {
      margin-bottom: 0;
    }

    .print-label,
    .print-section-title,
    .print-sign-label {
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .print-value {
      text-transform: uppercase;
    }

    .print-value-strong {
      font-weight: 700;
    }

    .print-value-payment {
      font-size: 1.6mm;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .print-sub-label {
      padding-left: 3.2mm;
    }

    .print-sub-label-payment {
      font-size: 1.85mm;
      white-space: nowrap;
      text-transform: uppercase;
    }

    .print-section-title-indented {
      padding-left: 3.2mm;
    }

    .print-currency,
    .print-amount {
      font-weight: 700;
    }

    .print-currency {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      text-align: right;
      padding-right: 0.7mm;
      line-height: 1;
      min-height: 2.8mm;
      padding-bottom: 0.2mm;
      transform: none;
      white-space: nowrap;
    }

    .print-amount {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      text-align: right;
      border-bottom: 0.2mm solid rgba(40, 40, 40, 1);
      min-height: 2.8mm;
      padding-bottom: 0.2mm;
      line-height: 1;
    }

    .print-row-section {
      margin-top: 0.65mm;
    }

    .print-row-major {
      margin-top: 4mm;
    }

    .print-row-net {
      margin-top: 1mm;
      margin-bottom: 0.5mm;
    }

    .print-block-gap {
      height: 0.4mm;
    }

    .print-signatures {
      margin-top: 0.5in;
      padding-top: 0;
      display: grid;
      gap: 2.7mm;
    }

    .print-signature-item {
      display: grid;
      gap: 0.45mm;
    }

    .print-sign-write-line {
      display: block;
      width: 50%;
      height: 3.8mm;
      border-bottom: 0.2mm solid rgba(20, 20, 20, 0.7);
    }

    .print-sign-label {
      font-style: italic;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }

    .print-sign-name {
      font-weight: 700;
    }

    .print-sign-role {
      font-size: 2.05mm;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .print-sheet {
        border: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-sheet">${slips}</div>
</body>
</html>
  `;
}

export function initCreateTab() {
  const openButton = document.getElementById("open-print-sample-btn");
  if (!openButton) return;

  openButton.addEventListener("click", async () => {
    const headerSource = await resolveHeaderImageSource();
    const previewHtml = buildPrintDocument(headerSource);
    const blob = new Blob([previewHtml], { type: "text/html" });
    const previewUrl = URL.createObjectURL(blob);

    const openLink = document.createElement("a");
    openLink.href = previewUrl;
    openLink.target = "_blank";
    openLink.rel = "noopener";
    openLink.style.display = "none";
    document.body.appendChild(openLink);
    openLink.click();
    openLink.remove();

    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
    }, 60000);
  });
}
