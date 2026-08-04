const fetch = require('node:http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/',
  method: 'GET'
};

const req = fetch.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    // Find all image tags or BookOpen or CoursesSection elements in the HTML
    console.log("Length of HTML:", data.length);
    const hasBookOpen = data.includes("lucide-book-open");
    const imgMatches = data.match(/<img[^>]+>/g);
    console.log("Has Lucide BookOpen icon:", hasBookOpen);
    console.log("Image tags count in HTML:", imgMatches ? imgMatches.length : 0);
    if (imgMatches) {
        console.log("First 10 images:");
        console.log(imgMatches.slice(0, 10).join("\n"));
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
