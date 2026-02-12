# インストール手順

## 開発モードでの使用（推奨）

### 必要な環境
- Node.js 18以上
- npm

### 手順

1. **リポジトリをクローン**
```bash
git clone https://github.com/shira9808/my-system.git
cd my-system
```

2. **依存関係をインストール**
```bash
npm install
```

3. **アプリを起動**
```bash
npm start
```

これで、アプリが起動します！

---

## Windowsインストーラの作成

エンドユーザー向けにインストーラを配布したい場合：

### 1. インストーラをビルド

```bash
npm run dist
```

### 2. 生成されるファイル

`release/` ディレクトリに以下のファイルが生成されます：

- `入金消込アプリ Setup X.X.X.exe` - インストーラ
- `入金消込アプリ-X.X.X.exe` - ポータブル版（インストール不要）

### 3. インストーラの配布

生成された `.exe` ファイルを配布してください。

### 4. エンドユーザーでのインストール

1. `入金消込アプリ Setup X.X.X.exe` をダブルクリック
2. インストール先を選択（デフォルト: `C:\Program Files\入金消込アプリ`）
3. 「インストール」をクリック
4. デスクトップにショートカットが作成されます
5. ショートカットから起動

---

## macOS / Linuxでの使用

現在はWindows専用の設定ですが、開発モードなら動作します：

```bash
# インストール
npm install

# 起動
npm start
```

macOS/Linux用のインストーラを作成したい場合は、`package.json` の `build` セクションに以下を追加：

```json
"mac": {
  "target": ["dmg"]
},
"linux": {
  "target": ["AppImage"]
}
```

---

## トラブルシューティング

### npm installでエラーが出る

```bash
# Node.jsのバージョン確認
node --version  # 18以上が必要

# キャッシュクリア
npm cache clean --force
npm install
```

### アプリが起動しない

```bash
# TypeScriptのビルドを確認
npm run build

# distディレクトリが生成されているか確認
ls -la dist/
```

### インストーラ生成でエラーが出る

Windowsでビルドする必要があります：
- Windows環境で `npm run dist` を実行
- または、GitHub Actionsでビルド（CI/CD設定が必要）

---

## 開発者向け情報

詳細は `DEVELOPMENT.md` を参照してください。

- デバッグ方法
- コード構造
- 開発ワークフロー
