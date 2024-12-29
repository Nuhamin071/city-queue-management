const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
 
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to send notifications
app.post('/send-notification', async (req, res) => {
  const { fcmToken, title, body } = req.body;

  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ message: 'Error sending notification', error });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
