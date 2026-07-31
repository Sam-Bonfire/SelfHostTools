const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log(`\nURL: ${url}`);
          console.log(`HTTP STATUS: ${res.statusCode}`);
          const scriptRegex = /<script[^>]*src="([^"]*)"/g;
          let match;
          while ((match = scriptRegex.exec(data)) !== null) {
            console.log(`- ${match[1]}`);
          }
          resolve();
        });
      })
      .on('error', (err) => {
        console.error(`Error fetching ${url}:`, err.message);
        resolve();
      });
  });
}

async function start() {
  await check('https://calculators.yomite.in/');
  await check('https://self-host-calculators.pages.dev/');
}

start();
