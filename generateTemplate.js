const { SESClient, CreateTemplateCommand } = require('@aws-sdk/client-ses');
require('dotenv').config();

const client = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const templateParams = {
    Template: {
        TemplateName: "MyTemplate",
        SubjectPart: "Hello, {{name}}",
        TextPart: "Dear {{name}},\nYour custom message goes here.",
        HtmlPart: "<h1>Hello {{name}}</h1><p>Your custom message goes here.</p>",
    },
};

const createTemplate = async () => {
    try {
        const command = new CreateTemplateCommand(templateParams);
        const response = await client.send(command);
        console.log("Template created successfully:", response);
    } catch (error) {
        console.error("Error creating template:", error);
    }
};

createTemplate();
