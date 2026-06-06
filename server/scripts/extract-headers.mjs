import fs from 'fs';

const js = fs.readFileSync('dewu-sign-chunk.js', 'utf8');
for (const marker of ['cnSC:function', 'VLrD:function', 'aCH8:function']) {
  const idx = js.indexOf(marker);
  console.log('\n===', marker, idx);
  if (idx > -1) console.log(js.slice(idx, idx + 1500));
}
