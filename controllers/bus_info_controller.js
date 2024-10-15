const {
  redBusPool,
  abhiBusPool,
  makeMyTripPool,
  easeMyTripPool,
  goibiboPool,
  adaniOnePool,
  viaPool,
  yatraPool,
  travelyaariPool,
  irctcPool,
  cleartripPool,
  busIndiaPool,
  paytmPool,
  ixigoPool,
  tbsWebPool
} = require('../config/dbconfig');

// Fetch platform details from a database pool
const fetchPlatformDetails = async (pool) => {
  const query = `
    SELECT id AS "platformId", "Platform_name" AS "platformName"
    FROM platform_details
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching platform details:', err);
    throw new Error('Error fetching platform details');
  }
};

// Fetch bus details from the database
const fetchBusDetails = async (pool) => {
  const query = `
    SELECT "Bus_id", "Operator_name", "source_name", "Destination_name"
    FROM static_data_details
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching bus details:', err);
    throw new Error('Error fetching bus details');
  }
};

// Fetch low price for a specific Bus_id from a specific database
const fetchLowPriceForBusId = async (pool, busId) => {
  const query = `
    SELECT low_price
    FROM live_data_details
    WHERE "Bus_id" = $1
  `;

  try {
    const result = await pool.query(query, [busId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching low price:', err);
    throw new Error('Error fetching low price');
  }
};

// Insert bus information into the NBZ_CRM database
const insertBusInfo = async (bus_id, operator_name, platform_prices, low_price, platformLowPrices, source_name, destination_name) => {
  const query = `
    INSERT INTO bus_info ("operator_name", "Bus_id", "og_std", "og_low_price", "redBus", "ABHI_Bus", "MakeMyTrip", "EaseMyTrip", "Goibibo", "AdaniOne", "VIA", "Yatra", "Travelyaari", "IRCTC", "Cleartrip", "BUSINDIA", "Paytm", "Ixigo", "source_name", "Destination_name")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
  `;

  try {
    await tbsWebPool.query(query, [
      operator_name, bus_id, platform_prices, low_price, 
      platformLowPrices.redBus, platformLowPrices.AbhiBus, platformLowPrices.MakeMyTrip,
      platformLowPrices.EaseMyTrip, platformLowPrices.Goibibo, platformLowPrices.AdaniOne,
      platformLowPrices.VIA, platformLowPrices.Yatra, platformLowPrices.Travelyaari,
      platformLowPrices.IRCTC, platformLowPrices.Cleartrip, platformLowPrices.BUSINDIA,
      platformLowPrices.Paytm, platformLowPrices.Ixigo, source_name, destination_name
    ]);
    console.log(`Inserted data for Bus_id: ${bus_id}`);
  } catch (err) {
    console.error('Error inserting data into bus_info table:', err);
    throw new Error('Error inserting data');
  }
};

// Main function to fetch data and insert it into the database
const mainFunc = async (req, res) => {
  try {
    // Fetch platform details from all pools
    const platformPools = [
      redBusPool, abhiBusPool, makeMyTripPool, easeMyTripPool,
      goibiboPool, adaniOnePool, viaPool, yatraPool, travelyaariPool,
      irctcPool, cleartripPool, busIndiaPool, paytmPool, ixigoPool
    ];

    // Fetch platform details for each pool
    const platformDetailsPromises = platformPools.map(pool => fetchPlatformDetails(pool));
    const allPlatformDetails = await Promise.all(platformDetailsPromises);

    // Flatten the array of results into a single list of platforms
    const platforms = allPlatformDetails.flat().map((details, index) => {
      console.log(`Platform Details from pool ${index}:`, details); // Debug log
      return {
        pool: platformPools[index],
        platformId: details.platformId,
        platformName: details.platformName
      };
    });

    console.log('All Platforms:', platforms); // Debug log

    const busDetails = await fetchBusDetails(redBusPool);

    for (const busDetail of busDetails) {
      const { "Bus_id": Bus_id, "Operator_name": Operator_name, "source_name": Source_name, "Destination_name": Destination_name } = busDetail;

      // Fetch platform prices for the current Bus_id
      const platformPrices = await Promise.all(platforms.map(async (platform) => {
        console.log(`Fetching price for ${platform.platformName} (ID: ${platform.platformId})`); // Debug log
        const priceData = await fetchLowPriceForBusId(platform.pool, Bus_id);
        if (priceData) {
          console.log(`Price data for ${platform.platformName} (ID: ${platform.platformId}):`, priceData); // Debug log
          return { id: platform.platformId, name: platform.platformName, price: parseFloat(priceData.low_price) };
        } else {
          console.log(`No price data found for ${platform.platformName} (ID: ${platform.platformId})`); // Debug log
          return null;
        }
      }));

      // Filter out null values and format platform_prices
      const validPrices = platformPrices.filter(entry => entry !== null && !isNaN(entry.price));
      console.log('Valid Prices:', validPrices); // Debug log
      const platformPricesStr = validPrices.length > 0 
        ? `{${validPrices.map(entry => `"${entry.id},${entry.name},${entry.price}"`).join(',')}}`
        : '{}'; // Empty array format if no prices are available

      // Create an object to hold the low prices for each platform
      const platformLowPrices = validPrices.reduce((acc, entry) => {
        acc[entry.name] = entry.price;
        return acc;
      }, {});

      // Find the lowest price among the platforms
      let lowestPriceEntry = validPrices.reduce((min, current) => {
        return (current.price < min.price) ? current : min;
      }, validPrices[0]);

      const finalLowPrice = lowestPriceEntry 
        ? `{${lowestPriceEntry.id},${lowestPriceEntry.name},${lowestPriceEntry.price}}`
        : 'NULL';

      // Insert data into bus_info table
      await insertBusInfo(Bus_id, Operator_name, platformPricesStr, finalLowPrice, platformLowPrices, Source_name, Destination_name);
    }

    console.log('All data combined and inserted successfully.');
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error('Error fetching and inserting data:', err);
    res.status(500).json({ error: 'Error processing data' });
  }
};

module.exports = {
  mainFunc
};
