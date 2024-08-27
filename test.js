const express = require("express");
const { SESClient, SendBulkTemplatedEmailCommand, SendEmailCommand } = require("@aws-sdk/client-ses");
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

const handleFileUploadError = (res) => {
    console.error('File upload failed');
    return res.status(400).send('No file uploaded.');
};

const parseCSV = (filePath, destinations, isTemplate) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                    const destination = isTemplate
                        ? {
                            Destination: {
                                ToAddresses: [row.email],
                            },
                            ReplacementTemplateData: JSON.stringify({ name: row.name }),
                        }
                        : {
                            ToAddresses: [row.email],
                        };
                    destinations.push(destination);
                }
            })
            .on('end', () => resolve(destinations))
            .on('error', (error) => reject(error));
    });
};

const sendBulkEmailWithTemplate = async (destinations) => {
    const params = {
        Destinations: destinations,
        Source: "codeguyakash@akssh.xyz",
        Template: "ThankYouTemplate",
        DefaultTemplateData: '{"name":"Customer"}',
        ReplyToAddresses: ["codeguyakash@akssh.xyz"],
    };

    try {
        const command = new SendBulkTemplatedEmailCommand(params);
        const response = await client.send(command);
        console.log("Bulk email sent successfully", response);
    } catch (err) {
        console.error("Error sending bulk email", err);
        throw err;
    }
};

const sendBulkEmailWithoutTemplate = async (destinations, subject, body) => {
    for (const destination of destinations) {
        const params = {
            Source: "no-reply@akssh.xyz",
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
};

app.post('/send-bulk-email', upload.single('file'), async (req, res) => {
    if (!req.file) return handleFileUploadError(res);

    const filePath = req.file.path;
    const destinations = [];

    try {
        await parseCSV(filePath, destinations, true);
        if (destinations.length === 0) return res.status(400).send("No valid email addresses found.");

        await sendBulkEmailWithTemplate(destinations);
        res.status(200).send("Bulk email sent successfully");
    } catch (err) {
        res.status(500).send("Error sending bulk email");
    } finally {
        fs.unlinkSync(filePath);
    }
});

app.post('/send-bulk-without-email', upload.single('file'), async (req, res) => {
    if (!req.file) return handleFileUploadError(res);

    const { subject, body } = req.body;
    const filePath = req.file.path;
    const destinations = [];

    try {
        await parseCSV(filePath, destinations, false);
        if (destinations.length === 0) return res.status(400).send("No valid email addresses found.");

        await sendBulkEmailWithoutTemplate(destinations, subject, body);
        res.status(200).send("Bulk email process completed");
    } catch (err) {
        res.status(500).send("Error sending bulk email");
    } finally {
        fs.unlinkSync(filePath);
    }
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
