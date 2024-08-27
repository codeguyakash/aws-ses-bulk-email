const { SESClient, SendBulkTemplatedEmailCommand, SendEmailCommand, CreateTemplateCommand } = require('@aws-sdk/client-ses');
const fs = require('fs');
const path = require("path")
const { parseCSV, removeFile } = require('../utils/csvParser');


const template = path.join('template.html')
const client = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const sendBulkEmailWithTemplate = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req?.file?.path;
    const destinations = [];

    try {
        await parseCSV(filePath, destinations, true);
        if (destinations.length === 0) return res.status(400).send("No valid email addresses found.");

        const params = {
            Destinations: destinations,
            Source: "no-reply@akssh.xyz",
            Template: "Subscribe",
            DefaultTemplateData: '{"name":"Customer"}',
            ReplyToAddresses: ["no-reply@akssh.xyz"],
        };

        const command = new SendBulkTemplatedEmailCommand(params);
        const response = await client.send(command);
        console.log("Bulk email sent successfully", response);
        res.status(200).send("Bulk email sent successfully");
    } catch (error) {
        console.error("Error sending bulk email", error);
        res.status(500).send("Error sending bulk email");
    } finally {
        removeFile(filePath);
    }
};

const sendBulkEmailWithoutTemplate = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { subject, body } = req.body;
    const filePath = req?.file?.path;
    const destinations = [];

    try {
        await parseCSV(filePath, destinations, false);
        if (destinations.length === 0) return res.status(400).send("No valid email addresses found.");

        for (const destination of destinations) {
            const params = {
                Source: "no-reply@akssh.xyz",
                Destination: destination,
                Message: {
                    Subject: { Data: subject },
                    Body: { Text: { Data: body } },
                },
            };

            const command = new SendEmailCommand(params);
            await client.send(command);
        }
        res.status(200).send("Bulk email process completed");
    } catch (error) {
        console.error("Error creating template::", error);
        res.status(500).send({ statusCode: 500 })
    } finally {
        removeFile(filePath);
    }
};

const templateParams = {
    Template: {
        TemplateName: "Subscribe",
        SubjectPart: "Thank You for Subscribing, {{name}}!",
        TextPart: "Dear {{name}},\nThank you for subscribing to our newsletter.",
        HtmlPart: template,
    },
};

const createTemplate = async (req, res) => {
    try {
        const command = new CreateTemplateCommand(templateParams);
        const response = await client.send(command);
        console.log("Template created successfully:", response);
        res.status(201).send("Template created successfully:")
    } catch (error) {
        console.error("Error creating template::", error?.Error?.Message);
        res.status(500).send({ statusCode: 500, message: error?.Error?.Message })
    }
};

module.exports = {
    sendBulkEmailWithTemplate,
    sendBulkEmailWithoutTemplate,
    createTemplate

};
