// sendNotification.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // Make sure to replace with your service account JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send a notification
const sendNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
    };

    // Send notification
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return response; // You can return the response or handle it as needed
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error('Error sending notification');
  }
};

// Export the sendNotification function
module.exports = sendNotification;
