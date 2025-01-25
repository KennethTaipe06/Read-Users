const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'create-user-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_CREATE_USER, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const encryptedMessage = JSON.parse(message.value.toString());
        const decryptedMessage = userService.decryptMessage(encryptedMessage);
        console.log('Mensaje descifrado:', decryptedMessage);

        const userData = JSON.parse(decryptedMessage);
        const userId = new mongoose.Types.ObjectId(userData._id);
        const user = new User({ _id: userId, ...userData });
        await user.save();
        console.log('Usuario insertado en la base de datos:', user);
      } catch (error) {
        console.error('Error al procesar el mensaje de Kafka:', error);
      }
    },
  });
};

module.exports = { run };
