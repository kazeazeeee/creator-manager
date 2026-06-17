const fs = require('fs');

async function test() {
  const url = "https://www.instagram.com/urufachann/";
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const text = await res.text();
  fs.writeFileSync('scratch/ig.html', text, 'utf8');
  console.log('Saved scratch/ig.html');
}

test();
