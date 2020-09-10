const fs = require('fs');
const path = require('path');

fs.copyFileSync(path.join(__dirname, 'src', 'static-glitz.ts'), path.join(__dirname, 'cjs', 'static-glitz.ts'));
