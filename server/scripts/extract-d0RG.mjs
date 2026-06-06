import fs from 'fs';

const js = fs.readFileSync('dewu-sign-chunk.js', 'utf8');
const marker = 'd0RG:function';
const idx = js.indexOf(marker);
console.log('d0RG idx', idx);
if (idx > -1) {
  console.log(js.slice(idx, idx + 5000));
}
