const fs = require('fs');
const https = require('https');

// packages.jsonからパッケージリストを読み込み
const packagesConfig = JSON.parse(fs.readFileSync('packages.json', 'utf8'));
const indexTemplate = JSON.parse(fs.readFileSync('index.json', 'utf8'));

async function fetchPackageInfo(repoUrl, packageJsonPath) {
    const url = repoUrl.replace('https://github.com/', 'https://raw.githubusercontent.com/') + '/main/' + packageJsonPath;
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const packageJson = JSON.parse(data);
                    resolve(packageJson);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function updateIndex() {
    const packages = {};
    const versions = {};
    
    for (const pkg of packagesConfig.packages) {
        try {
            console.log(`Fetching package info for ${pkg.name}...`);
            const packageJson = await fetchPackageInfo(pkg.repo, pkg.packageJsonPath);
            
            // パッケージ情報を構築
            if (!packages[pkg.name]) {
                packages[pkg.name] = { versions: {} };
            }
            
            packages[pkg.name].versions[packageJson.version] = {
                ...packageJson,
                url: `${pkg.repo}/releases/download/${pkg.name}-${packageJson.version}/${pkg.name}-${packageJson.version}.zip`
            };
            
            if (!versions[pkg.name]) {
                versions[pkg.name] = [];
            }
            if (!versions[pkg.name].includes(packageJson.version)) {
                versions[pkg.name].push(packageJson.version);
            }
            
            console.log(`Added ${pkg.name} v${packageJson.version}`);
        } catch (error) {
            console.error(`Failed to fetch ${pkg.name}:`, error.message);
        }
    }
    
    // index.jsonを更新
    const updatedIndex = {
        ...indexTemplate,
        packages,
        versions
    };
    
    fs.writeFileSync('index.json', JSON.stringify(updatedIndex, null, 2));
    console.log('index.json updated successfully!');
}

updateIndex().catch(console.error);