import express from 'express';
import http from 'http';
import cors from 'cors';

import { PORT } from './config.js';

const app = express();
const server = http.createServer(app);

//Middlewares de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//RUTAS USER
import indexRoutes from "./routes/index.routes.js"

//RUTAS RECOMMENDATIONS
import recommendationsRoutes from './routes/recommendations.routes.js'

//RUTAS SEARCHING
import searchRoutes from './routes/search.routes.js'

//RUTAS DETAILS 
import detailsRoutes from './routes/details.routes.js'

//RUTAS PLACES
import placesRoutes from './routes/places.routes.js'

//USE ROUTERS USER
app.use('/api/v1/', indexRoutes)

//USE ROUTERS RECOMMENDATIONS
app.use('/api/v1/recommendations', recommendationsRoutes)

//USER ROUTERS SEARCHING
app.use('/api/v1/search', searchRoutes)

// USE ROUTERS DETAILS
app.use('/api/v1/details', detailsRoutes)

//USER ROUTERS PLACES
app.use('/api/v1/places', placesRoutes)

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

server.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});