import type { Payslip } from "@/hooks/usePayroll";

export const formatPayslipMonth = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

export const formatPayrollStatusLabel = (status?: string | null) => {
  if (!status) return "Not available";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const comparePayslipsByPeriodDesc = (left: Payslip, right: Payslip) => {
  if (left.year !== right.year) {
    return right.year - left.year;
  }

  if (left.month !== right.month) {
    return right.month - left.month;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
};

export const getPayslipHtml = (payslip: Payslip) => {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Payslip - ${payslip.employeeName || "Employee"} - ${formatPayslipMonth(payslip.month, payslip.year)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 0; color: #111827; background: #f3f4f6; }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        background: #111827;
        color: #ffffff;
      }
      .toolbar-title { font-size: 14px; font-weight: 600; }
      .toolbar-sub { font-size: 12px; color: #d1d5db; margin-top: 4px; }
      .toolbar-actions { display: flex; gap: 12px; }
      .toolbar-button {
        border: 0;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .toolbar-button-primary { background: #2563eb; color: #ffffff; }
      .toolbar-button-secondary { background: #e5e7eb; color: #111827; }
      .page {
        max-width: 900px;
        margin: 24px auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      }
      .header { display: flex; justify-content: space-between; margin-bottom: 16px; }
      .title { font-size: 24px; font-weight: 700; }
      .sub { color: #6b7280; font-size: 14px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
      .label { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
      .value { font-size: 14px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; font-size: 13px; text-align: left; }
      .total { font-weight: 700; }
      @media print {
        body { background: #ffffff; }
        .toolbar { display: none; }
        .page {
          max-width: none;
          margin: 0;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div>
        <div class="toolbar-title">PayrollX Payslip</div>
        <div class="toolbar-sub">If you cancel print, this payslip will remain open on this page.</div>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-button toolbar-button-secondary" type="button" onclick="window.close()">Close</button>
        <button class="toolbar-button toolbar-button-primary" type="button" onclick="window.print()">Download PDF</button>
      </div>
    </div>
    <div class="page">
      <div class="header">
        <div>
          <div class="title">PayrollX Payslip</div>
          <div class="sub">Period: ${formatPayslipMonth(payslip.month, payslip.year)}</div>
        </div>
        <div class="sub">Generated: ${new Date().toLocaleString()}</div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="label">Employee</div>
          <div class="value">${payslip.employeeName || "-"}</div>
        </div>
        <div class="card">
          <div class="label">Employee Code</div>
          <div class="value">${payslip.employeeCode || "-"}</div>
        </div>
        <div class="card">
          <div class="label">Department</div>
          <div class="value">${payslip.department || "-"}</div>
        </div>
        <div class="card">
          <div class="label">Designation</div>
          <div class="value">${payslip.designation || "-"}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr><th colspan="2">Earnings</th></tr>
        </thead>
        <tbody>
          <tr><td>Basic Salary</td><td>PKR ${payslip.earnings.basicSalary.toLocaleString()}</td></tr>
          <tr><td>Allowances + Overtime</td><td>PKR ${(payslip.grossSalary - payslip.earnings.basicSalary).toLocaleString()}</td></tr>
          <tr class="total"><td>Gross Salary</td><td>PKR ${payslip.grossSalary.toLocaleString()}</td></tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr><th colspan="2">Deductions</th></tr>
        </thead>
        <tbody>
          <tr><td>Income Tax</td><td>PKR ${payslip.deductions.incomeTax.toLocaleString()}</td></tr>
          <tr><td>Other Deductions</td><td>PKR ${(payslip.totalDeductions - payslip.deductions.incomeTax).toLocaleString()}</td></tr>
          <tr class="total"><td>Total Deductions</td><td>PKR ${payslip.totalDeductions.toLocaleString()}</td></tr>
        </tbody>
      </table>

      <table>
        <tbody>
          <tr class="total"><td>Net Salary</td><td>PKR ${payslip.netSalary.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
    <script>
      window.addEventListener("load", function () {
        window.setTimeout(function () {
          window.print();
        }, 300);
      });
    </script>
  </body>
</html>`;
};

export const downloadPayslipPdf = (payslip: Payslip) => {
  const payslipHtml = getPayslipHtml(payslip);
  const popupWindow = window.open("", "_blank", "width=960,height=1080");

  if (popupWindow) {
    popupWindow.document.open();
    popupWindow.document.write(payslipHtml);
    popupWindow.document.close();
    popupWindow.focus();

    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");

  const cleanup = () => {
    window.setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }

    frameWindow.focus();
    frameWindow.print();
    cleanup();
  };

  document.body.appendChild(iframe);

  const frameDocument = iframe.contentDocument;
  if (!frameDocument) {
    cleanup();
    return;
  }

  frameDocument.open();
  frameDocument.write(payslipHtml);
  frameDocument.close();
};
