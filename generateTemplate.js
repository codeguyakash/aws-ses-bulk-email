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
        TemplateName: "ThankYouTemplate",
        SubjectPart: "Thank You for Subscribing, {{name}}!",
        TextPart: "Dear {{name}},\nThank you for subscribing to our newsletter. We're excited to have you on board!",
        HtmlPart: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You for Subscribing</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        line-height: 1.6;
                        color: #333333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007BFF;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .cta-button {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #007BFF;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .cta-button:hover {
                        background-color: #0056b3;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #777777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Thank You for Subscribing!</h1>
                    <p>Dear {{name}},</p>
                    <p>We are thrilled to have you on board! By subscribing to our newsletter, you’ve joined a community of passionate individuals who love staying informed and inspired. We're excited to bring you the latest news, insights, and updates directly to your inbox.</p>
                    <p>As a token of our appreciation, keep an eye out for exclusive content, special offers, and more – all curated just for you.</p>
                    <p>If you have any questions, feel free to reach out. We're here to help!</p>
                    <a href="https://codeguyakash.me" class="cta-button">Visit Our Website</a>
                    <div class="footer">
                        <p>&copy; 2024 codeguyakash. All rights reserved.</p>
                        <p>If you no longer wish to receive emails from us, <a href="#">unsubscribe here</a>.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
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
