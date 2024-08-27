const express = require("express");
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/emails', emailRoutes);

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
