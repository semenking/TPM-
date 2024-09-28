const axios = require('axios');
const { startBot } = require('./index.js');
const version = '0.0.2';
const os = require('os');
const path = require('path');
const exePath = process.cwd();
const fs = require('fs');
const { spawn } = require('child_process');

let osName = os.platform();

if (osName == 'win32') osName = 'win.exe';
else if (osName == 'darwin') osName = 'macos';

if (__filename.includes(`TPM-rewrite-temp-${osName}`)) {
    fs.renameSync(__filename, path.resolve(exePath, `TPM-rewrite-${osName}`));
}

async function downloadExe(latestVer) {

    console.log('starting to download');
    const tempPath = path.resolve(exePath, `TPM-rewrite-temp-${osName}`)
    console.log('hey')
    const writer = fs.createWriteStream(tempPath);

    const url = `https://github.com/IcyHenryT/TPM-rewrite/releases/download/${latestVer}/TPM-rewrite-${osName}`;

    const exeDownload = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    console.log('hi')
    exeDownload.data.pipe(writer);
    console.log('hi again')
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

}

function runExecutable(executablePath) {
    const child = spawn('"' + executablePath + '"', { stdio: 'inherit', shell: true });

    child.on('error', (error) => {
        console.error('tpm died :( ', error);
    });
}

(async () => {
    const latestVer = (await axios.get('https://api.github.com/repos/IcyHenryT/TPM-rewrite/releases/latest'))?.data?.tag_name;

    if (!latestVer) {
        console.error(`Failed to check for auto update. Launching bot`);
        startBot();
        return;
    }

    if (latestVer !== version) {
        await downloadExe(latestVer);
        runExecutable(path.resolve(exePath, `TPM-rewrite-temp-${osName}`));
    } else {
        console.log(`TPM up to date! Launching bot`);
        startBot();
        return;
    }

})();
