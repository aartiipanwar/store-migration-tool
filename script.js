const fileInput = document.getElementById("fileInput");
const migrateBtn = document.getElementById("migrateBtn");
const seoBtn = document.getElementById("seoBtn");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const output = document.getElementById("output");
const seoArea = document.getElementById("seoArea");
const tableArea = document.getElementById("tableArea");
const status = document.getElementById("status");
const loadSample = document.getElementById("loadSample");

let parsedData = [];
let migratedData = [];

const sampleCSV = `product_id,product_name,description,price,sku,slug,meta_title,meta_description
1,Men Cotton Shirt,100% cotton slim fit shirt,899,SKU-001,men-cotton-shirt,Buy Men Cotton Shirt,Shop the latest men cotton shirts.
2,Women Denim Jacket,Classic blue denim jacket,1299,SKU-002,women-denim-jacket,Women Denim Jacket Online,Trendy denim jackets for women.`;

//=====CSV Parser=====
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1);
  return rows.map(row => {
    const values = row.split(",");
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
    return obj;
  });
}

// ==== Handle File Upload ====
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    const text = evt.target.result;
    if (file.name.endsWith(".csv")) parsedData = parseCSV(text);
    else parsedData = JSON.parse(text);

    status.textContent = `${parsedData.length} records loaded successfully ✅`;
  };
  reader.readAsText(file);
});

// ==== Migration Logic ====
function runMigration() {
  if (!parsedData.length) {
    alert("Please upload a CSV or JSON file first!");
    return;
  }

  migratedData = parsedData.map(item => ({
    Handle: item.slug,
    Title: item.product_name,
    "Body (HTML)": item.description,
    "Variant Price": item.price,
    "Variant SKU": item.sku,
    "SEO Title": item.meta_title,
    "SEO Description": item.meta_description
  }));

  output.textContent = JSON.stringify(migratedData, null, 2);
  status.textContent = "Migration completed successfully ✅";
}

// ==== SEO Check ====
function runSEOCheck() {
  if (!parsedData.length || !migratedData.length) {
    alert("Run migration first!");
    return;
  }

  let report = [];
  parsedData.forEach((oldItem, i) => {
    const newItem = migratedData[i];
    const slugMatch = oldItem.slug === newItem.Handle;
    const titleMatch = oldItem.meta_title === newItem["SEO Title"];
    const descMatch = oldItem.meta_description === newItem["SEO Description"];
    const allGood = slugMatch && titleMatch && descMatch;

    report.push(
      `${oldItem.product_name} → ${allGood ? "✅ SEO Preserved" : "⚠️ SEO Mismatch"}`
    );
  });

  seoArea.innerHTML = `<pre>${report.join("\n")}</pre>`;
  status.textContent = "SEO Check complete ✅";
}

// ==== Preview Raw Table ====
function showTable() {
  if (!parsedData.length) {
    alert("Please upload data first!");
    return;
  }

  const keys = Object.keys(parsedData[0]);
  let html = "<table><thead><tr>";
  keys.forEach(k => html += `<th>${k}</th>`);
  html += "</tr></thead><tbody>";

  parsedData.forEach(row => {
    html += "<tr>";
    keys.forEach(k => html += `<td>${row[k]}</td>`);
    html += "</tr>";
  });

  html += "</tbody></table>";
  tableArea.innerHTML = html;
}

// ==== Download Migrated JSON ====
function downloadJSON() {
  if (!migratedData.length) {
    alert("Run migration first!");
    return;
  }

  const blob = new Blob([JSON.stringify(migratedData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "migrated_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==== Download Sample CSV ====
loadSample.addEventListener("click", () => {
  const blob = new Blob([sampleCSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_store_data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// ==== Event Listeners ====
migrateBtn.addEventListener("click", runMigration);
seoBtn.addEventListener("click", runSEOCheck);
previewBtn.addEventListener("click", showTable);
downloadBtn.addEventListener("click", downloadJSON);


