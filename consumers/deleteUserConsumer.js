const { Kafka } = require('kafkajs');
const userService = require('../services/userService');
const User = require('../models/User');
require('dotenv').config();

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'delete-user-group' });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_DELETE_USER, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                console.log('Mensaje recibido desde Kafka:', message.value.toString());
                const encryptedMessage = JSON.parse(message.value.toString());
                console.log('Mensaje encriptado:', encryptedMessage);
                const decryptedMessage = userService.decryptMessage(encryptedMessage);
                console.log('Mensaje descifrado:', decryptedMessage);

                const { id } = JSON.parse(decryptedMessage);
                console.log('ID del usuario a eliminar:', id);

                await User.findByIdAndDelete(id);
                console.log('Usuario eliminado exitosamente');
            } catch (error) {
                console.error('Error al procesar el mensaje de Kafka:', error);
            }
        },
    });
};

module.exports = { run };
