import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { app } from 'electron';

// 請求書データの型定義
export interface Invoice {
  取引先コード: string;
  法人名: string;
  施設名: string;
  請求額: number;
  入金予定日: string;
  入金日: string;
  入金額: number | null;
  手数料: number | null;
}

// 入金データの型定義
export interface Payment {
  入金日: string;
  入金額: number;
  入金元口座名義: string;
  銀行: string;
}

// データ保存先のパスを取得
export function getDataPath(filename: string): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, filename);
}

// CSV読み込み（汎用）
function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: Error) => reject(error));
  });
}

// 請求書CSVの読み込みと処理
export async function importInvoicesCSV(filePath: string): Promise<Invoice[]> {
  const rawData = await readCSV<any>(filePath);
  
  // データ変換と検証
  const invoices: Invoice[] = rawData
    .map((row: any) => {
      // 請求額を数値に変換
      const 請求額 = parseFloat(row['請求額'] || '0');
      
      // 請求額が0または空欄の場合は除外
      if (!請求額 || 請求額 === 0) {
        return null;
      }
      
      return {
        取引先コード: row['取引先コード'] || '',
        法人名: row['法人名'] || '',
        施設名: row['施設名'] || '',
        請求額: 請求額,
        入金予定日: row['入金予定日'] || '',
        入金日: row['入金日'] || '',
        入金額: row['入金額'] ? parseFloat(row['入金額']) : null,
        手数料: row['手数料'] ? parseFloat(row['手数料']) : null
      };
    })
    .filter((item): item is Invoice => item !== null);
  
  // ローカルJSONへ保存
  const savePath = getDataPath('invoices.json');
  fs.writeFileSync(savePath, JSON.stringify(invoices, null, 2), 'utf-8');
  
  return invoices;
}

// 入金CSVの読み込みと処理
export async function importPaymentsCSV(filePath: string): Promise<Payment[]> {
  const rawData = await readCSV<any>(filePath);
  
  // データ変換
  const payments: Payment[] = rawData.map((row: any) => ({
    入金日: row['入金日'] || '',
    入金額: parseFloat(row['入金額'] || '0'),
    入金元口座名義: row['入金元口座名義'] || '',
    銀行: row['銀行'] || ''
  }));
  
  // ローカルJSONへ保存
  const savePath = getDataPath('payments.json');
  fs.writeFileSync(savePath, JSON.stringify(payments, null, 2), 'utf-8');
  
  return payments;
}

// 保存されたデータの読み込み
export function loadInvoices(): Invoice[] {
  try {
    const filePath = getDataPath('invoices.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('請求書データの読み込みエラー:', error);
    return [];
  }
}

export function loadPayments(): Payment[] {
  try {
    const filePath = getDataPath('payments.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('入金データの読み込みエラー:', error);
    return [];
  }
}
