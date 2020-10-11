const fs = require('fs');
const path = require('path');

fs.copyFileSync(path.join(__dirname, 'src', 'static-glitz.ts'), path.join(__dirname, 'cjs', 'static-glitz.ts'));
fs.copyFileSync(path.join(__dirname, 'src', 'static-react.ts'), path.join(__dirname, 'cjs', 'static-react.ts'));
fs.copyFileSync(path.join(__dirname, 'src', 'shared.ts'), path.join(__dirname, 'cjs', 'shared.ts'));
