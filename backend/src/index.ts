import express from 'express';
import Router from "express-promise-router";
import { fetchSeries } from './handlers';
import { validationErrorHandler } from './validators';

const router = Router();
router.get('/series', fetchSeries);


const app = express();
app.use(router);
app.use(validationErrorHandler);
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🐇[series]: Server is hopping at https://localhost:${PORT}`);
});