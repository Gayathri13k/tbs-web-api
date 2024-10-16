require('dotenv').config();
const { Pool } = require('pg');

const createPool = (database) => {
  return new Pool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database,
    ssl: true
  });
};

// Create pool instances for each database
const redBusPool = createPool(process.env.DATABASE1);
const abhiBusPool = createPool(process.env.DATABASE2);
const makeMyTripPool = createPool(process.env.DATABASE3);
const easeMyTripPool = createPool(process.env.DATABASE4);
const goibiboPool = createPool(process.env.DATABASE5);
const adaniOnePool = createPool(process.env.DATABASE6);
const viaPool = createPool(process.env.DATABASE7);
const yatraPool = createPool(process.env.DATABASE8);
const travelyaariPool = createPool(process.env.DATABASE9);
const irctcPool = createPool(process.env.DATABASE10);
const cleartripPool = createPool(process.env.DATABASE11);
const busIndiaPool = createPool(process.env.DATABASE12);
const paytmPool = createPool(process.env.DATABASE13);
const ixigoPool = createPool(process.env.DATABASE14);
const tbsWebPool = createPool(process.env.DATABASE16); 
const tbsCrmPool = createPool(process.env.TBS_CRM);

// Export the pool instances for use in other modules
module.exports = {
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
  tbsWebPool,
  tbsCrmPool 
};
