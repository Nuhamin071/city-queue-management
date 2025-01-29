const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");  // Import CORS

// Load the service account key JSON file
const serviceAccount = require('./cityqueuemanagment-firebase-adminsdk-o6q1h-97514ca948.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

// Endpoint to handle queue status updates
app.post("/sendNotification", async (req, res) => {
    const { userId, newStatus, notificationType } = req.body;

    // Fetch the user's FCM token from Firestore
    const userDoc = await admin.firestore().collection("users").doc(userId).get();

    if (!userDoc.exists) {
        console.error(`No user found with ID: ${userId}`);
        return res.status(404).send("User not found");
    }

    const fcmToken = userDoc.data().fcmToken;

    if (!fcmToken) {
        console.error(`No FCM token found for user ID: ${userId}`);
        return res.status(404).send("FCM token not found");
    }

    // Prepare notification message based on new status
    let message = "";
    let title = "";

    if (notificationType === "queue") {
        if (newStatus === "called") {
            message = "You are called!";
            title = "You Are Called";  // Title for queue updates
        } else if (newStatus === "removed") {
            message = "Thank you for using our Service.";
            title = "You have been removed from the queue"; // Title for removal notification
        } else {
            // Exit early if the status is not relevant
            return res.status(200).send("No notification sent for this status.");
        }
    } else if (notificationType === "appointment") {
        message = "Your appointment is approaching.";
        title = "Appointment Reminder";  // Title for appointment reminders
    } else {
        message = "You have a new notification.";
        title = "New Notification";  // Title for other types of notifications
    }

    // Create notification document in Firestore
    const notificationRef = admin.firestore().collection("notifications").doc();
    await notificationRef.set({
        userId: userId,
        message: message,
        status: newStatus,
        notificationType: notificationType,
        isRead: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Prepare notification payload
    const payload = {
        notification: {
            title: title,  // Dynamically set based on notification type
            body: message, // Dynamically set based on notification type
        },
        data: {
            showStatusPage: "true", // Flag to show Status page
        },
        token: fcmToken,   // The user's device token
    };

    // Send notification
    try {
        await admin.messaging().send(payload);
        console.log("Notification sent successfully:", payload);
        return res.status(200).send("Notification sent");
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).send("Error sending notification");
    }
});

app.post("/sendWhenNotification", async (req, res) => {
    const { userId, newStatus } = req.body;

    // Logic to fetch user's position in the queue
    const userQueueDoc = await admin.firestore().collection("queue").where("user_id", "==", userId).get();
    
    if (!userQueueDoc.empty) {
        const userDoc = userQueueDoc.docs[0];
        const data = userDoc.data();
        
        // Assuming `peopleAhead` is stored in Firestore
        const peopleAhead = data.peopleAhead; // This should be calculated based on current queue state

        if (newStatus === "three_ahead" && peopleAhead === 3) {
            // Send notification for three people ahead
            await sendNotification(userId, "There are now 3 people ahead of you.");
        } else if (peopleAhead === 2) {
            // Send notification for two people ahead
            await sendNotification(userId, "There are now 2 people ahead of you.");
        } else if (peopleAhead === 1) {
            // Send notification for one person ahead
            await sendNotification(userId, "There is now 1 person ahead of you.");
        }
    }

    res.status(200).send("Notification preferences updated.");
});

// Function to send notifications via FCM
const sendNotification = async (userId, message) => {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    
    if (userDoc.exists) {
        const fcmToken = userDoc.data().fcmToken;
        
        const payload = {
            notification: {
                title: "Queue Update",
                body: message,
            },
            token: fcmToken,
        };

        await admin.messaging().send(payload);
    }
};


async function manageQueue() {
    try {
        const db = admin.firestore();
        const queueRef = db.collection('queue');
        const queueDocs = await queueRef.get();

        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

        const currentTime = new Date().getTime();

        queueDocs.forEach(doc => {
            const data = doc.data();

            if (data.status === 'called') {
                if (!data.timestamp) {
                    // If timestamp is not already set, initialize it with current time
                    doc.ref.update({ timestamp: currentTime });
                }

                if (data.isWait) {
                    if (currentTime - data.timestamp > tenMinutes + fiveMinutes) {
                        // After 15 minutes (10 minutes + 5 minutes)
                        doc.ref.update({ status: 'removed', timestamp: currentTime });
                    }
                } else {
                    if (currentTime - data.timestamp > tenMinutes) {
                        // After 10 minutes
                        doc.ref.update({ status: 'removed', timestamp: currentTime });
                    }
                }
            } else if (data.status === 'removed') {
                if (currentTime - data.timestamp > twoMinutes) {
                    // Delete document after 2 minutes in "removed" status
                    doc.ref.delete();
                }
            }
        });
    } catch (error) {
        console.error("Error managing queue:", error);
    }
}

// Run manageQueue periodically (every 10 minutes)
setInterval(manageQueue, 60000); 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
