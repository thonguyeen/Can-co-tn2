

const BASE_URL = 'http://localhost:4000/api/map';

async function runTests() {
    console.log('🧪 Starting Map API Tests...\n');
    let passed = 0;
    let failed = 0;

    try {
        // 1. Test GeoJSON Endpoint
        console.log('Testing GET /api/map/geojson ...');
        const geoRes = await fetch(`${BASE_URL}/geojson`);
        if (!geoRes.ok) throw new Error(`HTTP error! status: ${geoRes.status}`);
        const geoData = await geoRes.json();

        if (geoData.type !== 'FeatureCollection') {
            throw new Error(`Expected type 'FeatureCollection', got '${geoData.type}'`);
        }
        if (!Array.isArray(geoData.features)) {
            throw new Error('Expected features array');
        }
        console.log(`✅ /api/map/geojson PASS (${geoData.features.length} features returned)`);
        passed++;
    } catch (err: any) {
        console.error(`❌ /api/map/geojson FAIL:`, err.message);
        failed++;
    }

    console.log('-----------------------------------');

    try {
        // 2. Test District/Ward Prices Endpoint
        // Note: Assuming the endpoint exists. Let's hit district-prices just in case it exists.
        console.log('Testing GET /api/map/district-prices ...');
        const priceRes = await fetch(`${BASE_URL}/district-prices`);
        if (!priceRes.ok) throw new Error(`HTTP error! status: ${priceRes.status}`);
        const priceData = await priceRes.json();

        if (typeof priceData !== 'object' || Array.isArray(priceData)) {
            throw new Error(`Expected an object containing ward/district maps, got ${typeof priceData}`);
        }
        // Check if it has at least some keys
        const keys = Object.keys(priceData);
        console.log(`✅ /api/map/district-prices PASS (${keys.length} regions with data)`);
        passed++;
    } catch (err: any) {
        console.error(`❌ /api/map/district-prices FAIL:`, err.message);
        failed++;
    }

    console.log('\n===================================');
    console.log(`Test Summary: ${passed} Passed | ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests();
