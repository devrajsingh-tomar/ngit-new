const https = require('node:https');

https.get('https://ngitedu.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    const hasTyping = data.toLowerCase().includes('typing');
    console.log("Has 'typing' in HTML:", hasTyping);
    
    // Print occurrences
    let index = data.toLowerCase().indexOf('typing');
    let count = 0;
    while (index !== -1 && count < 10) {
      count++;
      console.log(`Occurrence ${count} at index ${index}:`);
      console.log(data.substring(index - 50, index + 150));
      index = data.toLowerCase().indexOf('typing', index + 1);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
