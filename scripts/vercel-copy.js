const fs = require('fs');  
if (fs.existsSync('frontend/dist')) {  
  if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });  
  fs.cpSync('frontend/dist', 'dist', { recursive: true });  
  console.log('Copied frontend/dist to dist');  
} else {  
  console.error('frontend/dist not found!'); process.exit(1);  
} 
