const fs = require('fs');

function test() {
  const ytHtml = fs.readFileSync("C:\\Users\\ALIEN\\Desktop\\agent manager\\scratch\\yt.html", 'utf8');

  // Let's find matches of shortsLockupViewModel
  // YouTube HTML contains JSON blocks. Let's find "shortsLockupViewModel" occurrences
  const regex = /"shortsLockupViewModel":\s*(\{[\s\S]*?\})\s*,\s*"[^"]+"\s*:/g;
  
  // Or let's look for videoId inside reelWatchEndpoint or videoRenderer
  // A simpler way: YouTube embeds initial data inside `ytInitialData = { ... };` in HTML.
  // Let's extract that object!
  const scriptMatch = ytHtml.match(/ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/) ||
                      ytHtml.match(/window\[['"]ytInitialData['"]\]\s*=\s*(\{[\s\S]*?\});/);
  
  if (scriptMatch) {
    try {
      // Find the JSON block by parsing curly braces
      let jsonStr = scriptMatch[1];
      // Clean up if there is trailing junk
      const data = JSON.parse(jsonStr);
      console.log("Found ytInitialData JSON!");
      
      const videos = [];
      
      // Let's traverse the JSON recursively or check the known paths:
      // contents.twoColumnBrowseResultsRenderer.tabs[...].tabRenderer.content.richGridRenderer.contents
      const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      tabs.forEach(tab => {
        const contents = tab.tabRenderer?.content?.richGridRenderer?.contents || [];
        contents.forEach(item => {
          const model = item.richItemRenderer?.content?.shortsLockupViewModel;
          if (model) {
            const videoId = model.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId || '';
            const accessibilityText = model.accessibilityText || '';
            
            // Extract title and views from accessibilityText, e.g. "Tebu bakar #asmr, 60 ribu x ditonton - putar video Shorts"
            const parts = accessibilityText.split(',');
            const title = parts[0]?.trim() || '';
            const viewsText = parts[1]?.replace('x ditonton', '')?.replace('- putar video Shorts', '')?.trim() || '';
            
            videos.push({
              id: `yt-video-${videoId}`,
              platform: 'YouTube',
              url: `https://www.youtube.com/shorts/${videoId}`,
              title: title,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/frame0.jpg`,
              viewsText: viewsText,
              videoId: videoId
            });
          }
        });
      });
      
      console.log(`Extracted YouTube videos count: ${videos.length}`);
      console.log(JSON.stringify(videos.slice(0, 10), null, 2));
    } catch (e) {
      console.error("Failed parsing:", e.message);
    }
  } else {
    console.log("No ytInitialData script match found.");
  }
}

test();
