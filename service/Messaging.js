const { admin } = require('../config/firebase');

const sendMessage = (category) => {
    let message = {
        notification: {
            title: 'Nowe obostrzenie.',
            body: `W kategorii ${category}`
        },
        topic: category,
    };

    admin.messaging().send(message)
        .then((response) => {
        console.log('Successfully sent message:', response);
        return null;
        })
        .catch((error) => {
        console.log('Error sending message:', error);
        });
}

module.exports = sendMessage;