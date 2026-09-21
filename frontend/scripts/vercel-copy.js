// Vercel post-build copy script  
// CWD = frontend/, dist/ = expo output, ../dist = root where Vercel looks  
const fs = require('fs');  
const path = require('path');  
const srcDir = path.resolve(process.cwd(), 'dist');  
const destDir = path.resolve(process.cwd(), '..', 'dist');  
if (fs.existsSync(srcDir)) {  
  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });  
  fs.cpSync(srcDir, destDir, { recursive: true });  
  console.log('Copied', srcDir, 'to', destDir);  
} else { console.error('dist not found:', srcDir); process.exit(1); } 
