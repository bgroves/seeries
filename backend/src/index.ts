import express from 'express';
const app = express();
const PORT = 8000;
app.get('/', (req, res) => res.send('Express + TypeScript Server'));
app.listen(PORT, () => {
    console.log(`🐇[series]: Server is hopping at https://localhost:${PORT}`);
});