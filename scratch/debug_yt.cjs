const fs = require('fs');

async function test() {
  const url = "https://www.youtube.com/@urufachannn";
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const text = await res.text();
  
  const matches = [];
  let index = text.indexOf('subscriberCountText');
  while (index !== -1) {
    matches.push(text.substring(index - 50, index + 200));
    index = text.indexOf('subscriberCountText', index + 1);
  }
  
  console.log('Matches for subscriberCountText:');
  console.log(matches);
}

test();
