const { ipcRenderer } = require('electron');

// DOM要素
const btnImportInvoices = document.getElementById('btn-import-invoices');
const btnImportPayments = document.getElementById('btn-import-payments');
const btnExecuteMatching = document.getElementById('btn-execute-matching');
const statusMessage = document.getElementById('status-message');
const invoiceCount = document.getElementById('invoice-count');
const paymentCount = document.getElementById('payment-count');
const resultsBody = document.getElementById('results-body');
const summarySection = document.getElementById('summary-section');
const countExact = document.getElementById('count-exact');
const countPartial = document.getElementById('count-partial');
const countUnmatched = document.getElementById('count-unmatched');

// 状態管理
let currentInvoices = [];
let currentPayments = [];
let currentResults = [];

// 初期化
async function init() {
  await loadData();
}

// データ読み込み
async function loadData() {
  const result = await ipcRenderer.invoke('load-data');
  if (result.success) {
    currentInvoices = result.invoices || [];
    currentPayments = result.payments || [];
    updateDataCounts();
  }
}

// データ件数更新
function updateDataCounts() {
  invoiceCount.textContent = `請求書: ${currentInvoices.length}件`;
  paymentCount.textContent = `入金: ${currentPayments.length}件`;
}

// ステータスメッセージ表示
function showStatus(message, isSuccess = true) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  
  if (isSuccess) {
    statusMessage.classList.add('success');
  } else {
    statusMessage.classList.add('error');
  }
  
  // 5秒後に消す
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 5000);
}

// 請求書CSV取込
btnImportInvoices.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('import-invoices');
  
  if (result.success) {
    currentInvoices = result.data;
    updateDataCounts();
    showStatus(result.message, true);
  } else {
    showStatus(result.message, false);
  }
});

// 入金CSV取込
btnImportPayments.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('import-payments');
  
  if (result.success) {
    currentPayments = result.data;
    updateDataCounts();
    showStatus(result.message, true);
  } else {
    showStatus(result.message, false);
  }
});

// 照合実行
btnExecuteMatching.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('execute-matching');
  
  if (result.success) {
    currentResults = result.data;
    displayResults(currentResults);
    showStatus(result.message, true);
  } else {
    showStatus(result.message, false);
  }
});

// 結果表示
function displayResults(results) {
  if (!results || results.length === 0) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center empty-message">
          照合結果がありません。<br>
          CSV を取り込んで照合を実行してください。
        </td>
      </tr>
    `;
    summarySection.style.display = 'none';
    return;
  }
  
  // テーブル行を生成
  resultsBody.innerHTML = results.map(row => {
    const 判定バッジ = getBadgeClass(row.判定);
    const 入金額表示 = row.入金額 !== null 
      ? formatCurrency(row.入金額) 
      : '-';
    const 差額表示 = row.差額 > 0 
      ? formatCurrency(row.差額) 
      : '-';
    
    return `
      <tr>
        <td>${escapeHtml(row.法人名)}</td>
        <td>${escapeHtml(row.施設名)}</td>
        <td class="text-right">${formatCurrency(row.請求額)}</td>
        <td class="text-right">${入金額表示}</td>
        <td class="text-right">${差額表示}</td>
        <td class="text-center">
          <span class="badge ${判定バッジ}">${row.判定}</span>
        </td>
        <td>${escapeHtml(row.入金日 || '-')}</td>
        <td>${escapeHtml(row.入金元口座名義 || '-')}</td>
      </tr>
    `;
  }).join('');
  
  // サマリー更新
  updateSummary(results);
  summarySection.style.display = 'flex';
}

// サマリー更新
function updateSummary(results) {
  const exact = results.filter(r => r.判定 === '〇').length;
  const partial = results.filter(r => r.判定 === '△').length;
  const unmatched = results.filter(r => r.判定 === '未一致').length;
  
  countExact.textContent = `${exact}件`;
  countPartial.textContent = `${partial}件`;
  countUnmatched.textContent = `${unmatched}件`;
}

// 判定バッジのクラス取得
function getBadgeClass(判定) {
  switch (判定) {
    case '〇':
      return 'badge-exact';
    case '△':
      return 'badge-partial';
    case '未一致':
      return 'badge-unmatched';
    default:
      return '';
  }
}

// 通貨フォーマット
function formatCurrency(value) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(value);
}

// HTMLエスケープ
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// アプリ起動時に初期化
init();
