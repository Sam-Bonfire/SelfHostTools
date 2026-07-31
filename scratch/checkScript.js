const https = require('https');

https
  .get('https://calculators.yomite.in/assets/index-DC0tk_Ni.js', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Script size: ${data.length} bytes`);

      // Check if ErrorBoundary exists in the live JavaScript
      const hasErrorBoundary =
        data.includes('ErrorBoundary') || data.includes('standard-deviated') || data.includes('UH OH');
      console.log(`Contains ErrorBoundary code? ${hasErrorBoundary}`);

      // Check if EmergencyFundCalculator has default export
      const hasEmergencyDefault = data.includes('EmergencyFundCalculator');
      console.log(`Contains EmergencyFundCalculator? ${hasEmergencyDefault}`);
    });
  })
  .on('error', (err) => {
    console.error('Error:', err.message);
  });
