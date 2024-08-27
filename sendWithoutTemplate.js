const express = require("express");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
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

    const { subject, body } = req.body;
    const destinations = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                const destination = {
                    ToAddresses: [row.email],
                };
                destinations.push(destination);
            }
        })
        .on('end', async () => {
            if (destinations.length === 0) {
                res.status(400).send("No valid email addresses found.");
                return;
            }

            for (const destination of destinations) {
                const params = {
                    Source: "to@akssh.xyz",
                    Destination: destination,
                    Message: {
                        Subject: {
                            Data: subject,
                        },
                        Body: {
                            Text: {
                                Data: body,
                            },
                        },
                    },
                };

                try {
                    const command = new SendEmailCommand(params);
                    const response = await client.send(command);
                    console.log(`Email sent to ${destination.ToAddresses[0]}:`, response);
                } catch (err) {
                    console.error(`Error sending email to ${destination.ToAddresses[0]}`, err);
                }
            }

            fs.unlinkSync(filePath);
            res.status(200).send("Bulk email process completed");
        });
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
