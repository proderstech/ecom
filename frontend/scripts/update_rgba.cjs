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
        
        let newContent = content.replace(/rgba\(\s*(255|0)\s*,\s*(255|0)\s*,\s*(255|0)\s*,([^)]+)\)/g, (match, r, g, b, alpha) => {
            if (r === '255') {
                changed = true;
                return `rgba(0,0,0,${alpha})`;
            } else if (r === '0') {
                changed = true;
                return `rgba(255,255,255,${alpha})`;
            }
            return match;
        });

        newContent = newContent.replace(/rgba\(\s*4\s*,\s*4\s*,\s*4\s*,([^)]+)\)/g, (match, alpha) => {
            changed = true;
            return `rgba(255,255,255,${alpha})`;
        });

        newContent = newContent.replace(/rgba\(\s*20\s*,\s*20\s*,\s*20\s*,([^)]+)\)/g, (match, alpha) => {
            changed = true;
            return `rgba(255,255,255,${alpha})`;
        });

        if (changed) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated', filePath);
        }
    }
});
