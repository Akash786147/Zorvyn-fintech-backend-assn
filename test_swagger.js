const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup({}));
const server = app.listen(3001, () => {
    require('http').get('http://localhost:3001/docs/', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(data.includes('swagger') ? 'Working' : 'Not working');
            server.close();
            process.exit(0);
        });
    });
});
