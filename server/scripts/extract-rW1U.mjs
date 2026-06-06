import fs from 'fs';

const js = fs.readFileSync('dewu-sign-chunk.js', 'utf8');
const marker = 'rW1U:function';
const idx = js.indexOf(marker);
console.log('rW1U idx', idx);
if (idx > -1) {
  console.log(js.slice(idx, idx + 3000));
}

for (const m of ['newSign', 'createSign', 'getSign', 'signKey', 'duuuid', 'SK']) {
  let i = 0;
  let c = 0;
  while (c < 3) {
    i = js.indexOf(m, i + 1);
    if (i < 0) break;
    console.log(`\n[${m}]`, js.slice(Math.max(0, i - 80), i + 160));
    c++;
  }
}
