const { 
    redBusPool, abhiBusPool, makeMyTripPool, easeMyTripPool, goibiboPool, 
    adaniOnePool, viaPool, yatraPool, travelyaariPool, irctcPool, 
    cleartripPool, busIndiaPool, paytmPool, ixigoPool, tbsWebPool 
} = require('../config/dbconfig');

// Helper function to convert minutes to hours and minutes
const convertMinutesToHoursMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

const getBusDetails = async (req, res) => {
    const { source_name, destination_name, depat_datetime } = req.body;

    // Map database names to their respective pools
    const poolMap = {
        redBus: redBusPool,
        ABHI_BUS: abhiBusPool,
        MakeMyTrip: makeMyTripPool,
        EaseMyTrip: easeMyTripPool,
        Goibibo: goibiboPool,
        AdaniOne: adaniOnePool,
        VIA: viaPool,
        Yatra: yatraPool,
        Travelyaari: travelyaariPool,
        IRCTC: irctcPool,
        Cleartrip: cleartripPool,
        BUSINDIA: busIndiaPool,
        Paytm: paytmPool,
        Ixigo: ixigoPool
    };

    let allBuses = [];

    try {
        // Fetching the Bus_id and og_low_price from bus_info table in NBZ_CRM database
        const lowPriceQuery = `
            SELECT "Bus_id", "og_low_price" 
            FROM bus_info 
            WHERE "Bus_id" IS NOT NULL;
        `;
        const lowPriceResult = await tbsWebPool.query(lowPriceQuery);

        if (lowPriceResult.rows.length === 0) {
            return res.status(404).json({ message: 'No buses found in the bus_info table.' });
        }

        // Process each bus_id and its associated platform
        for (const { Bus_id, og_low_price } of lowPriceResult.rows) {
            
            const cleanedLowPrice = og_low_price.replace(/[{}]/g, '');
            const [ , platformName ] = cleanedLowPrice.split(',');

            console.log(`og_low_price: ${og_low_price}, Cleaned: ${cleanedLowPrice}, Platform Name: ${platformName}`);

            const pool = poolMap[platformName];
            if (!pool) {
                console.warn(`No pool found for platform: ${platformName}`);
                continue; // Skip if the platform is not found in the map
            }

            // Fetch data from static_data_details table
            const staticDataQuery = `
                SELECT "Bus_id", "Operator_name", "bus_type", "amenities", "boarding", "dropping", "source_name", "Destination_name" 
                FROM static_data_details 
                WHERE "Bus_id" = $1 AND "source_name" = $2 AND "Destination_name" = $3;
            `;
            const staticDataResult = await pool.query(staticDataQuery, [Bus_id, source_name, destination_name]);

            if (staticDataResult.rows.length === 0) {
                continue; 
            }

            for (let bus of staticDataResult.rows) {
                console.log(`Fetching nearly live data for Bus_id: ${bus.Bus_id}, depat_datetime: ${depat_datetime}`);
                
                // Fetching data from nearly_live_data_details table
                const nearlyLiveDataQuery = `
                    SELECT "depat_datetime", "Arrl_datetime", "Time_duration", "rating" 
                    FROM nearly_live_data_details 
                    WHERE "Bus_id" = $1 AND DATE("depat_datetime") = $2;
                `;
                
                console.log(`Executing query: ${nearlyLiveDataQuery}`);
                console.log(`With parameters: Bus_id = ${bus.Bus_id}, depat_datetime = ${depat_datetime}`);
                
                try {
                    const nearlyLiveDataResult = await pool.query(nearlyLiveDataQuery, [bus.Bus_id, depat_datetime]);
                    console.log('Nearly live data result:', nearlyLiveDataResult.rows);
                
                    if (nearlyLiveDataResult.rows.length > 0) {
                        const nearlyLiveData = nearlyLiveDataResult.rows[0];
                        bus.depat_datetime = nearlyLiveData.depat_datetime;
                        bus.Arrl_datetime = nearlyLiveData.Arrl_datetime;
                        bus.Time_duration = nearlyLiveData.Time_duration ? convertMinutesToHoursMinutes(nearlyLiveData.Time_duration) : null;
                        bus.rating = nearlyLiveData.rating;
                    } else {
                        bus.depat_datetime = null;
                        bus.Arrl_datetime = null;
                        bus.Time_duration = null;
                        bus.rating = null;
                    }
                } catch (error) {
                    console.error('Error executing nearly live data query:', error);
                    bus.depat_datetime = null;
                    bus.Arrl_datetime = null;
                    bus.Time_duration = null;
                    bus.rating = null;
                }
                
                // Fetching data from live_data_details table
                const liveDataQuery = `
                    SELECT "seats_avalble" 
                    FROM live_data_details 
                    WHERE "Bus_id" = $1;
                `;
                const liveDataResult = await pool.query(liveDataQuery, [bus.Bus_id]);

                if (liveDataResult.rows.length > 0) {
                    bus.seats_avalble = liveDataResult.rows[0].seats_avalble;
                } else {
                    bus.seats_avalble = null;
                }

                if (bus.amenities) {
                    // Split by comma, then trim and filter out empty strings
                    bus.amenities = bus.amenities
                        .split(/\s*,\s*/) // Split by comma with optional surrounding whitespace
                        .map(item => item.trim()) // Trim any leading or trailing whitespace
                        .filter(item => item.length > 0); // Remove any empty strings
                }

                if (og_low_price) {
                    // Remove curly braces, then split by comma, trim, and filter
                    bus.low_price = og_low_price
                        .replace(/[{}]/g, '') // Remove curly braces
                        .split(/\s*,\s*/) // Split by comma with optional surrounding whitespace
                        .map(item => item.trim()) // Trim any leading or trailing whitespace
                        .filter(item => item.length > 0); // Remove any empty strings
                }

                // Add the bus data to the final result array
                allBuses.push(bus);
            }
        }

        if (allBuses.length === 0) {
            return res.status(404).json({ message: 'No buses found for the provided source, destination, and departure time.' });
        }

        res.json(allBuses);

    } catch (error) {
        console.error('Error fetching bus details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getBusDetails,
};
