# 開発ガイド

このドキュメントは、入金消込アプリの開発者向けガイドです。

## 開発環境のセットアップ

### 必要なツール
- Node.js 18以上
- npm
- Git
- Visual Studio Code（推奨）

### 初回セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/shira9808/my-system.git
cd my-system

# 依存関係をインストール
npm install

# TypeScriptをビルド
npm run build

# アプリを起動
npm start
```

## 開発ワークフロー

### TypeScript開発
TypeScriptファイルを編集したら、必ずビルドしてから起動してください：

```bash
# ビルド
npm run build

# 起動
npm start

# または一度に実行
npm start
```

### デバッグ
Electronアプリのデバッグ方法：

1. `electron/main.ts` の以下のコメントを外す：
```typescript
mainWindow.webContents.openDevTools();
```

2. アプリを再起動すると開発者ツールが開きます

### ホットリロード
現在ホットリロードは未実装です。ファイルを変更したら：
1. アプリを閉じる
2. `npm run build` でビルド
3. `npm start` で再起動

## プロジェクト構造の詳細

### backend/
バックエンドロジックを含むディレクトリ

#### csv-import.ts
CSV読み込みとデータ保存を担当
- `importInvoicesCSV()`: 請求書CSV読み込み
- `importPaymentsCSV()`: 入金CSV読み込み
- `loadInvoices()`: 保存済み請求書読み込み
- `loadPayments()`: 保存済み入金読み込み

#### matching.ts
照合ロジックを担当
- `matchPayments()`: 請求書と入金の照合
- `sortMatchResults()`: 結果のソート

### electron/
Electronのメインプロセス

#### main.ts
- ウィンドウ管理
- IPCハンドラー
  - `import-invoices`: 請求書CSV取込
  - `import-payments`: 入金CSV取込
  - `execute-matching`: 照合実行
  - `load-data`: データ読み込み

### frontend/
レンダラープロセス（UI）

#### index.html
アプリのメインUI構造

#### app.js
UIロジック
- イベントハンドラー
- テーブル表示
- IPC通信

#### styles.css
アプリのスタイル定義

## データフロー

```
1. ユーザーがCSV取込ボタンをクリック
   ↓
2. frontend/app.js が ipcRenderer.invoke() を呼び出し
   ↓
3. electron/main.ts の ipcMain.handle() が処理
   ↓
4. backend/csv-import.ts でCSVを読み込み
   ↓
5. データをローカルJSONに保存
   ↓
6. 結果をフロントエンドに返す
   ↓
7. UIを更新
```

## テスト

### 手動テスト
1. サンプルCSVを使用してテスト
```bash
# data/sample_invoices.csv
# data/sample_payments.csv
```

2. 期待される結果：
- 完全一致(〇): 3件
- ほぼ一致(△): 1件
- 未一致: 1件

### ユニットテスト（未実装）
今後、Jest等を導入予定

## ビルドとリリース

### 開発ビルド
```bash
npm run build
```

### Windowsインストーラ生成
```bash
npm run dist
```

インストーラは `release/` ディレクトリに生成されます。

### ビルド設定
`package.json` の `build` セクションで設定：
- `appId`: アプリケーションID
- `productName`: 製品名
- `win`: Windows用設定
- `nsis`: インストーラ設定

## トラブルシューティング

### ビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run build
```

### Electronが起動しない
- TypeScriptのビルドが完了しているか確認
- `dist/` ディレクトリにJSファイルが存在するか確認

### CSVが読み込めない
- CSVの文字コードが UTF-8 か確認
- カラム名が仕様通りか確認
- 請求額が数値として認識できるか確認

## コーディング規約

### TypeScript
- strictモードを有効化
- 型定義を明示的に記述
- interfaceを活用

### 命名規則
- ファイル名: kebab-case (`csv-import.ts`)
- クラス名: PascalCase
- 関数名: camelCase
- 定数: UPPER_SNAKE_CASE

### コミットメッセージ
Conventional Commits形式を使用：
```
feat: 新機能
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加
chore: その他の変更
```

## 今後の開発予定

### Phase 2（拡張機能）
- [ ] ソルバー機能（最適マッチング）
- [ ] 複数CSV一括取込
- [ ] フィルター機能
- [ ] エクスポート機能

### Phase 3（高度な機能）
- [ ] PDF出力
- [ ] リスクスコア算出
- [ ] ダッシュボード
- [ ] 統計表示

### Phase 4（AI機能）
- [ ] 企業名あいまい一致
- [ ] 学習機能
- [ ] 予測機能

## 参考リンク

- [Electron公式ドキュメント](https://www.electronjs.org/docs/latest)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [electron-builder](https://www.electron.build/)
