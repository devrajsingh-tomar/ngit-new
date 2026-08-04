const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            searchDir(filePath);
        } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js'))) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = [];
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.includes('blue-') || line.includes('indigo-') || line.includes('bg-blue') || line.includes('text-blue')) {
                    matches.push({ lineNum: idx + 1, text: line.trim() });
                }
            });
            if (matches.length > 0) {
                console.log(`FILE: ${filePath}`);
                matches.forEach(m => {
                    console.log(`  L${m.lineNum}: ${m.text}`);
                });
            }
        }
    }
}

console.log("Searching components/public...");
searchDir('e:/Ngit/src/components/public');
console.log("\nSearching app/public...");
searchDir('e:/Ngit/src/app/(public)');
