# Email Service API Documentation

## Overview

This API provides endpoints to send bulk emails with or without a template using AWS SES (Simple Email Service). It also includes the ability to create a new email template in SES.

## Prerequisites

- AWS SES setup with the necessary credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) configured in the `.env` file.
- A verified domain in AWS SES to send emails from.
- The `template.html` file is available in the project directory for sending templated emails.

## API Endpoints

### 1. Send Bulk Email Without Template

- **Endpoint**: `POST /api/emails/without-template`
- **Description**: Sends a bulk email without using a predefined template.
- **Request Parameters**:
  - **Headers**:
    - `Content-Type: multipart/form-data`
  - **Form Data**:
    - `file` (required): CSV file containing the list of email addresses. Each row should have at least one column named `email`.
    - `subject` (required): The subject of the email.
    - `body` (required): The body of the email.
- **Response**:
  - **200 OK**: Bulk email process completed.
  - **400 Bad Request**: No valid email addresses found or file not uploaded.
  - **500 Internal Server Error**: Error while sending emails.
- **Example Request**:

```bash
curl -X POST http://localhost:3000/api/emails/without-template \
  -H "Content-Type: multipart/form-data" \
  -F "file=@emails.csv" \
  -F "subject=Welcome to our service" \
  -F "body=Thank you for joining us!"
```

### 2. Send Bulk Email With Template

- **Endpoint**: `POST /api/emails/with-template`
- **Description**: Sends a bulk email using a predefined SES template.
- **Request Parameters**:
  - **Headers**:
    - `Content-Type: multipart/form-data`
  - **Form Data**:
    - `file` (required): CSV file containing the list of email addresses. Each row should have at least one column named `email`.
- **Response**:
  - **200 OK**: Bulk email sent successfully.
  - **400 Bad Request**: No valid email addresses found or file not uploaded.
  - **500 Internal Server Error**: Error while sending emails.
- **Example Request**:

```bash
curl -X POST http://localhost:3000/api/emails/with-template \
  -H "Content-Type: multipart/form-data" \
  -F "file=@emails.csv"
```

### 3. Create Email Template

- **Endpoint**: `GET /api/emails/generate-template`
- **Description**: Creates a new SES email template using the content from the `template.html` file.
- **Request Parameters**: None
- **Response**:
  - **201 Created**: Template created successfully.
  - **500 Internal Server Error**: Error while creating the template.
- **Example Request**:

```bash
curl -X GET http://localhost:3000/api/emails/generate-template
```

## CSV File Format

The CSV file should include a column named `email` and an optional column `name` for personalized emails.

**Example CSV**:

```csv
email,name
john.doe@example.com,John
jane.doe@example.com,Jane
```

## Error Handling

- **400 Bad Request**: Occurs when the CSV file is not uploaded or no valid email addresses are found.
- **500 Internal Server Error**: Occurs due to issues in processing the email sending requests or creating the template.

## Environment Variables

The following environment variables must be defined in your `.env` file:

```env
AWS_REGION=<Your-AWS-Region>
AWS_ACCESS_KEY_ID=<Your-Access-Key-ID>
AWS_SECRET_ACCESS_KEY=<Your-Secret-Access-Key>
```

## Local Development

1. Clone the repository.
2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the environment variables mentioned above.
4. Start the server:

```bash
npm start
```

5. The API will be accessible at `http://localhost:3000`.

## Contact

  codeguyakash@gmail.com