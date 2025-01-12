const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const redis = require('redis');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
const port = 3004;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Users API',
      version: '1.0.0',
      description: 'API para leer usuarios de MongoDB',
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect('mongodb://localhost:27017/Users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

app.use(cors());

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
