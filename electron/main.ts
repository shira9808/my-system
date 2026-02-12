import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import {
  importInvoicesCSV,
  importPaymentsCSV,
  loadInvoices,
  loadPayments
} from '../backend/csv-import';
import { matchPayments, sortMatchResults } from '../backend/matching';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // HTMLファイルをロード
  mainWindow.loadFile(path.join(__dirname, '../../frontend/index.html'));

  // 開発者ツールを開く（開発時のみ）
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPCハンドラー: 請求書CSVインポート
ipcMain.handle('import-invoices', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'キャンセルされました' };
    }

    const filePath = result.filePaths[0];
    const invoices = await importInvoicesCSV(filePath);

    return {
      success: true,
      message: `${invoices.length}件の請求書を読み込みました`,
      data: invoices
    };
  } catch (error: any) {
    return {
      success: false,
      message: `エラー: ${error.message}`
    };
  }
});

// IPCハンドラー: 入金CSVインポート
ipcMain.handle('import-payments', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'キャンセルされました' };
    }

    const filePath = result.filePaths[0];
    const payments = await importPaymentsCSV(filePath);

    return {
      success: true,
      message: `${payments.length}件の入金を読み込みました`,
      data: payments
    };
  } catch (error: any) {
    return {
      success: false,
      message: `エラー: ${error.message}`
    };
  }
});

// IPCハンドラー: 照合実行
ipcMain.handle('execute-matching', async () => {
  try {
    const invoices = loadInvoices();
    const payments = loadPayments();

    if (invoices.length === 0) {
      return {
        success: false,
        message: '請求書データがありません。先に請求書CSVを読み込んでください。'
      };
    }

    if (payments.length === 0) {
      return {
        success: false,
        message: '入金データがありません。先に入金CSVを読み込んでください。'
      };
    }

    const results = matchPayments(invoices, payments);
    const sortedResults = sortMatchResults(results);

    return {
      success: true,
      message: `${sortedResults.length}件の照合が完了しました`,
      data: sortedResults
    };
  } catch (error: any) {
    return {
      success: false,
      message: `エラー: ${error.message}`
    };
  }
});

// IPCハンドラー: データ読み込み
ipcMain.handle('load-data', async () => {
  try {
    const invoices = loadInvoices();
    const payments = loadPayments();

    return {
      success: true,
      invoices: invoices,
      payments: payments
    };
  } catch (error: any) {
    return {
      success: false,
      message: `エラー: ${error.message}`
    };
  }
});
