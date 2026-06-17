const texts = [
  "telur  Mateng #asmr, 2,2 juta x ditonton - putar video Shorts",
  "resep di tengah video ya, enakk #asmr, 240 ribu x ditonton - putar video Shorts",
  "makan Pete? #asmr, 1 x ditonton - putar video Shorts",
  "Seafood #asmr, 186 ribu x ditonton - putar video Shorts"
];

for (const text of texts) {
  const match = text.match(/^([\s\S]+?),\s*([\d.,]+\s*[^,]*?(?:ribu|juta|jt|rb|thousand|million|views|ditonton)[\s\S]*)$/i);
  if (match) {
    const title = match[1].trim();
    const viewsPart = match[2].trim();
    
    // Extract views text: grab the number and scale word
    const viewsMatch = viewsPart.match(/([\d.,]+\s*(?:ribu|juta|jt|rb|thousand|million)?)/i);
    const viewsText = viewsMatch ? viewsMatch[1] : '';
    
    console.log(`Original: "${text}"`);
    console.log(`Title: "${title}"`);
    console.log(`Views text: "${viewsText}"`);
    
    // Parse to number
    let cleaned = viewsText.replace(/,/g, '.').replace(/ribu|rb|thousand/gi, 'K').replace(/juta|jt|million/gi, 'M').replace(/\s+/g, '');
    let viewsNum = 0;
    if (cleaned.toLowerCase().includes('k')) {
      viewsNum = parseFloat(cleaned) * 1000;
    } else if (cleaned.toLowerCase().includes('m')) {
      viewsNum = parseFloat(cleaned) * 1000000;
    } else {
      viewsNum = parseFloat(cleaned) || 0;
    }
    console.log(`Views number: ${viewsNum}\n`);
  } else {
    console.log(`Failed for "${text}"`);
  }
}
