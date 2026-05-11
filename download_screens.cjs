const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'stitch_html');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const dataPath = path.join('C:', 'Users', 'acer', '.gemini', 'antigravity', 'brain', '87dcfcb5-850e-440a-9117-73df1cf8544c', '.system_generated', 'steps', '19', 'output.txt');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

data.screens.forEach(screen => {
    const title = screen.title.replace(/ /g, '_').replace(/&/g, 'and');
    const url = screen.htmlCode.downloadUrl;
    console.log(`Downloading ${title}...`);
    
    https.get(url, (res) => {
        const fileStream = fs.createWriteStream(path.join(dir, `${title}.html`));
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Finished ${title}`);
        });
    });
});
