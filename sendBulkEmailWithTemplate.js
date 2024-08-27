const express = require("express");
const { SESClient, SendBulkTemplatedEmailCommand } = require("@aws-sdk/client-ses");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

const client = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post('/send-bulk-email', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.error('File upload failed');
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    console.log('File path:', filePath);

    if (!filePath) {
        return res.status(500).send('File path is undefined');
    }

    const destinations = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                const destination = {
                    Destination: {
                        ToAddresses: [row.email],
                    },
                    ReplacementTemplateData: JSON.stringify({ name: row.name }),
                };
                destinations.push(destination);
            }
        })
        .on('end', async () => {
            if (destinations.length === 0) {
                res.status(400).send("No valid email addresses found.");
                return;
            }

            const params = {
                Destinations: destinations,
                Source: "codeguyakash@akssh.xyz",
                Template: "MyTemplate",
                DefaultTemplateData: '{"name":"Customer"}',
                ReplyToAddresses: ["codeguyakash@akssh.xyz"],
            };

            try {
                const command = new SendBulkTemplatedEmailCommand(params);
                const response = await client.send(command);
                console.log("Bulk email sent successfully", response);
                res.status(200).send("Bulk email sent successfully");
            } catch (err) {
                console.error("Error sending bulk email", err);
                res.status(500).send("Error sending bulk email");
            } finally {
                fs.unlinkSync(filePath);
            }
        });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
