const express = require('express');
const cors = require('cors');
const path = require('path')
const multer = require('multer')
const { passengerRouter } = require('./routers/passengerRouters');
const { faqrouter } = require('./routers/faqRoute');
const { feedbackRouter } = require('./routers/feedback_routes');
const { inquiryRouter } = require('./routers/inquiry_routes');
const { footrouter } = require('./routers/footerRotes');
const { toprouter } = require('./routers/topBusRoute');
const { popularouter } = require('./routers/popular_domestic_Routes');
const { busInfoRouter } = require('./routers/bus_info_routes');
const { cardRouter } = require('./routers/card_detail_routes');
const { tbsBusRoter } = require('./routers/tbsBusRoutes');
const { travelRoute } = require('./routers/travel_policy_route');
const { countRouter } = require('./routers/count_search_routes');
const { homeListRouter } = require('./routers/home_list_routes');
const { tbsInfoRouter } = require('./routers/tbs_info_routes');
const { referEarnRouter } = require('./routers/refer_earn_routes');
const { bookingRouter } = require('./routers/bookingDetails_routes');
const { ticketRouter } = require('./routers/ticket_view_routes');
const calendarRouter = require('./routers/peak_calendar_routes');
const { opRouter } = require('./routers/OperatorListRoutes');
const { seatRouter } = require('./routers/seatLayoutRoutes');
const { paxLogRouter } = require('./routers/passengerLogin_Routes');
const { countryRouter } = require('./routers/countryCodeRoutes');
const { logoRouter } = require('./routers/operatorLogoRoutes');
const { linkRouter } = require('./routers/linkSharingRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors())

app.use('/public/top_bus_rotes', express.static('public/top_bus_rotes'))
app.use('/public/popular_domestic_presence', express.static('public/popular_domestic_presence'))
app.use('/public/operator_logos', express.static('public/operator_logos'))

app.use('/api', passengerRouter)

app.use('/api', faqrouter)

app.use('/api', feedbackRouter)

app.use('/api', inquiryRouter)

app.use('/api', footrouter)

app.use('/api', toprouter)

app.use('/api', popularouter)

app.use('/api', busInfoRouter)

app.use('/api', cardRouter)

app.use('/api', tbsBusRoter)

app.use('/api', travelRoute)

app.use('/api', countRouter);

app.use('/api', homeListRouter);

app.use('/api', tbsInfoRouter);

app.use('/api', referEarnRouter);

app.use('/api', bookingRouter)

app.use('/api', ticketRouter)

app.use('/api', calendarRouter)

app.use('/api', opRouter)

app.use('/api', seatRouter)

app.use('/api', paxLogRouter)

app.use('/api', countryRouter)

app.use('/api', logoRouter)

app.use('/api', linkRouter)
  
app.listen(process.env.LOCALPORT, () => {
    console.log(`Server is up and running on port ${process.env.LOCALPORT}`)
})
