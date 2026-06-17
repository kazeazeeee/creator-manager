async function test() {
  const urls = [
    "https://www.instagram.com/urufachann/?__a=1&__d=1",
    "https://www.instagram.com/urufachann/?__a=1&__d=dis"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`URL: ${url} Status: ${res.status}`);
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      if (text.length > 0) {
        console.log(text.substring(0, 300));
      }
    } catch (e) {
      console.log(`Failed for ${url}: ${e.message}`);
    }
  }
}
test();
