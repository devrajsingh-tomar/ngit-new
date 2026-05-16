
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'uploads', 'materials');
const file = path.join(dir, 'test.txt');

try {
    if (!fs.existsSync(dir)) {
        console.log('Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, 'Hello World');
    console.log('Successfully wrote to:', file);
    fs.unlinkSync(file);
    console.log('Successfully deleted:', file);
} catch (err) {
    console.error('Error:', err.message);
}
