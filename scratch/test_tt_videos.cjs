const fs = require('fs');

function test() {
  const ttHtml = fs.readFileSync("C:\\Users\\ALIEN\\.gemini\\antigravity\\brain\\1b51e5cf-4c27-4c55-adec-e8565be0bcd4\\.system_generated\\steps\\800\\content.md", 'utf8');

  // Let's find the Schema JSON-LD ItemList
  const schemaMatch = ttHtml.match(/<script type="application\/ld\+json" id="ItemList">([\s\S]*?)<\/script>/);
  if (schemaMatch) {
    try {
      const data = JSON.parse(schemaMatch[1]);
      console.log("Found ItemList JSON!");
      const items = data.itemListElement || [];
      console.log(`Count of videos: ${items.length}`);
      
      const parsedVideos = items.map((item, index) => {
        const stats = item.interactionStatistic || [];
        const watchStat = stats.find(s => {
          const typeStr = typeof s.interactionType === 'object' ? s.interactionType?.['@type'] || '' : s.interactionType || '';
          return typeStr.includes('WatchAction');
        });
        const likeStat = stats.find(s => {
          const typeStr = typeof s.interactionType === 'object' ? s.interactionType?.['@type'] || '' : s.interactionType || '';
          return typeStr.includes('LikeAction');
        });
        
        return {
          id: `tt-video-${index}`,
          platform: 'TikTok',
          url: item.url,
          title: (item.name || '').replace(' | TikTok', ''),
          thumbnail: item.thumbnailUrl?.[0] || '',
          uploadDate: item.uploadDate ? item.uploadDate.split('T')[0] : '',
          views: watchStat ? watchStat.userInteractionCount : 0,
          likes: likeStat ? likeStat.userInteractionCount : 0
        };
      });
      console.log(JSON.stringify(parsedVideos, null, 2));
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
    }
  } else {
    console.log("No ItemList schema script found.");
  }
}

test();
