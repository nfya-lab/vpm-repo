# VRChat VPM Repository

VRChat Creator Companion用のパッケージリポジトリです。  
パッケージは個別のリポジトリで管理され、自動的に統合されます。

## 使い方

VRChat Creator Companion で以下のURLを追加してください：

```
https://nfya-lab.github.io/vrchat-vpm-repo/index.json
```

## パッケージの追加方法

1. 新しいパッケージのリポジトリを作成
2. `packages.json` にパッケージ情報を追加
3. GitHub Actionsが自動的にindex.jsonを更新

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

- 外部リポジトリからの自動パッケージ情報取得
- 6時間ごとの自動更新
- GitHub Pages での自動公開