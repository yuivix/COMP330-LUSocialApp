// backend/index.js
const app = require('./src/app');

const PORT = 4000; // no .env yet
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});