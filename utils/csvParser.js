const csv = require('csv-parser');
const fs = require('fs');

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
                        : { ToAddresses: [row.email] };
                    destinations.push(destination);
                }
            })
            .on('end', () => resolve(destinations))
            .on('error', (error) => reject(error));
    });
};
const removeFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete file: ${filePath}`, err);
        else console.log(`File deleted: ${filePath}`);
    });
};


module.exports = { parseCSV, removeFile };
