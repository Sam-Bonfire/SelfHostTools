const https = require('https');

function fetchUrl(url) {
  https
    .get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\nURL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        const matches = data.match(/src="[^"]*assets\/index-[^"]*\.js"/g) || [];
        console.log('Script tags found:', matches);
      });
    })
    .on('error', (err) => {
      console.error('Error fetching URL:', err);
    });
}

// Bypassing edge cache using query string cache busters
fetchUrl('https://self-host-calculators.pages.dev/?cb=' + Date.now());
fetchUrl('https://calculators.yomite.in/?cb=' + Date.now());
