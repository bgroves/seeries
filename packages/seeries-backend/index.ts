import express from 'express';
const app = express();
const PORT = 8000;
app.get('/', (req, res) => res.send('Express + TypeScript Seerver'));
app.listen(PORT, () => {
    console.log(`⚡️[seerver]: Seerver is running at https://localhost:${PORT}`);
});