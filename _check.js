const fs = require('fs');
const b = fs.readFileSync('public/data/videos.md');
console.log('First bytes:', b.slice(0, 10).toString('hex'));
console.log('Is JSON:', b[0] === 0x5b || b[0] === 0x7b);
console.log('File size:', b.length);
