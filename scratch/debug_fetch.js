async function test() {
  const urls = [
    "https://www.instagram.com/urufachann/",
    "https://www.tiktok.com/@urufachan",
    "https://www.youtube.com/@urufachannn"
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        }
      });
      console.log(`URL: ${url}`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Length: ${text.length}`);
      
      const meta = text.match(/<meta[^>]*description[^>]*>/i) || text.match(/<meta[^>]*og:description[^>]*>/i);
      if (meta) {
        console.log(`Meta: ${meta[0]}`);
      } else {
        console.log('No description meta tag found.');
      }
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }
}

test();
