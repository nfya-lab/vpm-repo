const fs = require('fs');
const https = require('https');

// packages.jsonからパッケージリストを読み込み
const packagesConfig = JSON.parse(fs.readFileSync('packages.json', 'utf8'));
const indexTemplate = JSON.parse(fs.readFileSync('index.json', 'utf8'));

async function fetchPackageInfo(repoUrl, packageJsonPath) {
    // Try main branch first, then master branch
    const baseUrl = repoUrl.replace('https://github.com/', 'https://raw.githubusercontent.com/');
    const urls = [
        `${baseUrl}/main/${packageJsonPath}`,
        `${baseUrl}/master/${packageJsonPath}`
    ];
    
    return new Promise((resolve, reject) => {
        let currentUrlIndex = 0;
        
        function tryNextUrl() {
            if (currentUrlIndex >= urls.length) {
                reject(new Error('All URL attempts failed'));
                return;
            }
            
            const currentUrl = urls[currentUrlIndex];
            console.log(`Trying URL: ${currentUrl}`);
            
            https.get(currentUrl, (res) => {
                let data = '';
                
                if (res.statusCode !== 200) {
                    console.log(`URL failed with status ${res.statusCode}: ${currentUrl}`);
                    currentUrlIndex++;
                    tryNextUrl();
                    return;
                }
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const packageJson = JSON.parse(data);
                        resolve(packageJson);
                    } catch (err) {
                        console.log(`JSON parse error for ${currentUrl}:`, err.message);
                        currentUrlIndex++;
                        tryNextUrl();
                    }
                });
            }).on('error', (err) => {
                console.log(`Request error for ${currentUrl}:`, err.message);
                currentUrlIndex++;
                tryNextUrl();
            });
        }
        
        tryNextUrl();
    });
}

async function detectDefaultBranch(repoUrl) {
    // Try to detect the default branch by checking which URL works
    const baseUrl = repoUrl.replace('https://github.com/', 'https://raw.githubusercontent.com/');
    const branches = ['main', 'master'];
    
    for (const branch of branches) {
        try {
            const testUrl = `${baseUrl}/${branch}/package.json`;
            const response = await new Promise((resolve, reject) => {
                https.get(testUrl, (res) => {
                    resolve(res.statusCode);
                }).on('error', reject);
            });
            
            if (response === 200) {
                return branch;
            }
        } catch (error) {
            continue;
        }
    }
    
    return 'master'; // fallback
}

async function updateIndex() {
    const packages = {};
    const versions = {};
    
    for (const pkg of packagesConfig.packages) {
        try {
            console.log(`Fetching package info for ${pkg.name}...`);
            const packageJson = await fetchPackageInfo(pkg.repo, pkg.packageJsonPath);
            const defaultBranch = await detectDefaultBranch(pkg.repo);
            
            // パッケージ情報を構築
            if (!packages[pkg.name]) {
                packages[pkg.name] = { versions: {} };
            }
            
            packages[pkg.name].versions[packageJson.version] = {
                ...packageJson,
                url: `${pkg.repo}/archive/refs/heads/${defaultBranch}.zip`
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