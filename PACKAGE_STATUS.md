# パッケージ配布について

## ✅ 作成済みパッケージ

このサンドボックス環境で **Linux用パッケージ** の作成に成功しました！

### 📦 生成されたファイル

```
release/
├── 入金消込アプリ-1.0.0.AppImage  (100MB) ← Linux用実行ファイル
└── linux-unpacked/                (253MB) ← 展開済みパッケージ
```

---

## 🚀 各OS向けパッケージの作成方法

### このサンドボックス（Linux環境）で作成可能

✅ **Linux用パッケージ**
```bash
npm run dist:linux
```

**生成されるもの:**
- ✅ AppImage (作成成功！)
- ❌ DEB (環境制約により失敗)
- ❌ RPM (環境制約により失敗)

### Windows/macOS環境で作成が必要

❌ **Windows用パッケージ** → Windows環境でのみ作成可能
```bash
npm run dist:win
```

❌ **macOS用パッケージ** → macOS環境でのみ作成可能
```bash
npm run dist:mac
```

---

## 📥 ダウンロード方法

### GitHubから直接ダウンロード

リポジトリをクローンして、releaseフォルダから取得：

```bash
git clone https://github.com/shira9808/my-system.git
cd my-system
# release/入金消込アプリ-1.0.0.AppImage が既にあります
```

### ローカルでビルド

```bash
# 1. リポジトリをクローン
git clone https://github.com/shira9808/my-system.git
cd my-system

# 2. 依存関係をインストール
npm install

# 3. パッケージ作成
npm run dist:linux    # Linux用
# または
npm run dist:win      # Windows用（Windows環境のみ）
# または  
npm run dist:mac      # macOS用（macOS環境のみ）
```

---

## 💡 推奨配布方法

### Windows環境をお持ちの場合

**最も簡単な方法:**
1. Windows PCでこのリポジトリをクローン
2. `npm install` を実行
3. `npm run dist:win` を実行
4. 生成された以下のファイルを配布：
   - `入金消込アプリ-1.0.0-portable.exe` (ポータブル版、推奨)
   - `入金消込アプリ Setup 1.0.0.exe` (インストーラ版)
   - `入金消込アプリ-1.0.0-win.zip` (ZIP版)

### Windows環境がない場合

**GitHub Actionsを使用（推奨）:**

`.github/workflows/build.yml` を作成すれば、GitHubが自動的に全OS向けパッケージをビルドします。

設定例（今後実装可能）:
```yaml
name: Build
on: [push]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run dist
```

これにより、コミットごとに自動的に全OS向けパッケージが生成されます。

---

## 🎯 現在の状況まとめ

| パッケージ種類 | 状態 | 作成場所 |
|-------------|------|---------|
| **Linux AppImage** | ✅ 作成済み | このサンドボックス |
| **Linux DEB** | ❌ 環境制約 | - |
| **Linux RPM** | ❌ 環境制約 | - |
| **Windows NSIS** | ⏳ 要Windows環境 | Windows PC必要 |
| **Windows Portable** | ⏳ 要Windows環境 | Windows PC必要 |
| **Windows ZIP** | ⏳ 要Windows環境 | Windows PC必要 |
| **macOS DMG** | ⏳ 要macOS環境 | macOS必要 |
| **macOS ZIP** | ⏳ 要macOS環境 | macOS必要 |

---

## ❓ よくある質問

### Q: このAppImageはWindowsで使える？

**A: いいえ。** AppImageはLinux専用です。

- **Linux**: AppImageを使用
- **Windows**: Windows PCで `npm run dist:win` を実行してパッケージ作成
- **macOS**: macOSで `npm run dist:mac` を実行してパッケージ作成

### Q: Windows用パッケージが必要な場合は？

**A: 以下の3つの方法があります:**

1. **Windows PCで直接ビルド**（最も簡単）
   ```bash
   npm run dist:win
   ```

2. **GitHub Actionsを使用**（自動化）
   - ワークフローファイルを追加
   - GitHubが自動ビルド

3. **クラウドビルドサービスを使用**
   - AppVeyor
   - Travis CI

### Q: パッケージサイズが大きいのはなぜ？

**A: Electronアプリの特性です。**

100MBは正常なサイズです：
- Node.js ランタイム
- Chromium ブラウザエンジン  
- アプリケーション本体

これにより、**他のソフトのインストール不要**で動作します。

### Q: 開発モードとパッケージ版の違いは？

| 項目 | 開発モード (`npm start`) | パッケージ版 |
|-----|------------------------|-----------|
| 依存関係 | Node.js必要 | 不要 |
| インストール | npm install必要 | 不要 |
| 配布 | 不可 | 可能 |
| サイズ | プロジェクト全体 | 100MB程度 |

---

詳細は `PACKAGING.md` を参照してください。
