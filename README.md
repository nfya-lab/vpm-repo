# VRChat VPM Repository

VRChat Creator Companion用のパッケージリポジトリです。  
パッケージは個別のリポジトリで管理され、自動的に統合されます。

## 使い方

VRChat Creator Companion で以下のURLを追加してください：

```
https://nfya-lab.github.io/vpm-repo/index.json
```

## パッケージの追加方法

### 自動連携（推奨）
1. 新しいパッケージリポジトリを作成
2. `.github/package-template.yml` を参考にGitHub Actionsワークフローを設定
3. パッケージをリリースすると自動的にVPMリポジトリに追加・更新される

### 手動追加
1. `packages.json` にパッケージ情報を手動追加
2. GitHub Actionsが自動的にindex.jsonを更新

### packages.json の形式

```json
{
  "packages": [
    {
      "name": "net.nfya.package-name",
      "repo": "https://github.com/nfya-lab/package-name",
      "packageJsonPath": "package.json"
    }
  ]
}
```

## 機能

- ✅ **自動パッケージ追加**: リリース時に自動でVPMリポジトリに追加
- ✅ **自動バージョン更新**: パッケージ更新時に自動でindex.jsonを更新
- ✅ **外部リポジトリ連携**: 個別リポジトリからの情報取得
- ✅ **GitHub Pages自動公開**: 更新内容を自動でWebに反映
- ✅ **UPMブランチ作成**: Unity Package Manager対応

## 新しいパッケージの作成手順

1. **リポジトリ作成**: 新しいVRChatパッケージのリポジトリを作成
2. **package.json作成**: VRChatパッケージの設定ファイルを作成
3. **ワークフロー設定**: `.github/package-template.yml` をコピーして `.github/workflows/release.yml` として配置
4. **リリース実行**: `git commit -m "Release X.X.X" && git push` でリリース
5. **自動登録**: VPMリポジトリに自動的に登録される