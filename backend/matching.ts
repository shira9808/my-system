import { Invoice, Payment } from './csv-import';

// 照合結果の型定義
export interface MatchResult {
  法人名: string;
  施設名: string;
  請求額: number;
  入金額: number | null;
  差額: number;
  判定: '〇' | '△' | '未一致';
  入金日?: string;
  入金元口座名義?: string;
}

/**
 * 照合ロジック（最小版）
 * - 完全一致: 差額0 → "〇"
 * - ほぼ一致: 差額1,000円以内 → "△"
 * - それ以外: "未一致"
 */
export function matchPayments(
  invoices: Invoice[],
  payments: Payment[]
): MatchResult[] {
  const results: MatchResult[] = [];
  
  // 入金データのマップを作成（金額をキーに）
  const paymentMap = new Map<number, Payment[]>();
  payments.forEach(payment => {
    const amount = payment.入金額;
    if (!paymentMap.has(amount)) {
      paymentMap.set(amount, []);
    }
    paymentMap.get(amount)!.push(payment);
  });
  
  // 各請求書に対して照合
  for (const invoice of invoices) {
    const 請求額 = invoice.請求額;
    let bestMatch: Payment | null = null;
    let minDiff = Infinity;
    let 判定: '〇' | '△' | '未一致' = '未一致';
    
    // 完全一致を探す
    if (paymentMap.has(請求額)) {
      const matches = paymentMap.get(請求額)!;
      if (matches.length > 0) {
        bestMatch = matches[0];
        minDiff = 0;
        判定 = '〇';
      }
    }
    
    // 完全一致がない場合、近い金額を探す
    if (!bestMatch) {
      for (const payment of payments) {
        const diff = Math.abs(請求額 - payment.入金額);
        
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = payment;
          
          // 差額1,000円以内なら△
          if (diff <= 1000) {
            判定 = '△';
          } else {
            判定 = '未一致';
          }
        }
      }
    }
    
    // 結果を追加
    results.push({
      法人名: invoice.法人名,
      施設名: invoice.施設名,
      請求額: 請求額,
      入金額: bestMatch ? bestMatch.入金額 : null,
      差額: minDiff === Infinity ? 0 : minDiff,
      判定: 判定,
      入金日: bestMatch ? bestMatch.入金日 : undefined,
      入金元口座名義: bestMatch ? bestMatch.入金元口座名義 : undefined
    });
  }
  
  return results;
}

/**
 * 照合結果をソート
 * 優先順位: 未一致 > △ > 〇
 */
export function sortMatchResults(results: MatchResult[]): MatchResult[] {
  const priority = { '未一致': 0, '△': 1, '〇': 2 };
  
  return results.sort((a, b) => {
    const priorityDiff = priority[a.判定] - priority[b.判定];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    // 同じ判定の場合は差額の大きい順
    return b.差額 - a.差額;
  });
}
