const https = require('https');

function get(url, options = {}) {
  return new Promise((resolve, reject) => {
    https
      .get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            text: () => Promise.resolve(data)
          });
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

function head(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'HEAD',
        port: 443
      },
      (res) => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      }
    );
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

async function crawl() {
  const sitemapUrl = 'https://calculators.yomite.in/sitemap.xml';
  console.log(`Fetching sitemap: ${sitemapUrl}`);

  try {
    const res = await get(sitemapUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap: ${res.status}`);
    }
    const text = await res.text();

    // Simple regex to extract urls from sitemap xml
    const urlRegex = /<loc>(https?:\/\/[^\s<>]+)<\/loc>/g;
    const urls = [];
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[1]);
    }

    console.log(`Found ${urls.length} URLs in sitemap. Checking HTTP statuses...`);

    const results = [];
    for (const url of urls) {
      try {
        const checkRes = await head(url);
        console.log(`[${checkRes.status}] ${url}`);
        results.push({ url, status: checkRes.status, ok: checkRes.ok });
      } catch (err) {
        console.log(`[ERR] ${url}: ${err.message}`);
        results.push({ url, status: 'ERROR', ok: false, error: err.message });
      }
    }

    const failed = results.filter((r) => !r.ok);
    console.log('\n--- CRAWL SUMMARY ---');
    console.log(`Total URLs Checked: ${results.length}`);
    console.log(`Successful (200 OK): ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);
    if (failed.length > 0) {
      console.log('Failed URLs:');
      failed.forEach((f) => console.log(`- [${f.status}] ${f.url}`));
    }
  } catch (err) {
    console.error(`Error during crawl: ${err.message}`);
  }
}

crawl();
