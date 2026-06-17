async function test() {
  const url = "https://imginn.com/urufachann/";
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    
    // Find followers count pattern
    const followMatch = text.match(/([\d.,]+[kKmM]?)\s*followers/i) || text.match(/followers[^\d]*([\d.,]+[kKmM]?)/i);
    if (followMatch) {
      console.log("Found match:", followMatch[0], "Group:", followMatch[1]);
    } else {
      console.log("No match found.");
      // Search for any mention of follower
      const idx = text.indexOf('follower');
      if (idx !== -1) {
        console.log(text.substring(idx - 50, idx + 150));
      }
    }
  } catch (e) {
    console.log("Failed:", e.message);
  }
}
test();
