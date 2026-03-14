const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.css') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Fix shadows
        // Let's replace rgba(255,255,255, ...) with rgba(0,0,0, ...) if it is preceded by box-shadow or --shadow
        // Actually, just find the whole line containing box-shadow or --shadow and replace 255 with 0
        let newContent = content.split('\n').map(line => {
            if (line.includes('box-shadow') || line.includes('--shadow')) {
                if (line.includes('rgba(255,255,255')) {
                    changed = true;
                    return line.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, 'rgba(0,0,0,');
                }
            }
            return line;
        }).join('\n');

        if (changed) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Fixed shadow in', filePath);
        }
    }
});
