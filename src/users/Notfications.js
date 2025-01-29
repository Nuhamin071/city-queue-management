import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { app } from '../firebase';
import Cookies from "js-cookie";
import { Container, Grid, Paper, Typography } from '@mui/material';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const userId = Cookies.get("user_id");
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchNotifications = async () => {
            const db = getFirestore(app);
            const notificationsRef = collection(db, "notifications");
            const q = query(notificationsRef, where("userId", "==", userId));

            try {
                const querySnapshot = await getDocs(q);
                const fetchedNotifications = [];

                querySnapshot.forEach((doc) => {
                    const notificationData = doc.data();
                    fetchedNotifications.push({
                        id: doc.id,
                        ...notificationData,
                        isNew: !notificationData.isRead,
                    });
                });

                fetchedNotifications.sort((a, b) => {
                    return b.timestamp.toDate() - a.timestamp.toDate();
                });

                setNotifications(fetchedNotifications);

                await Promise.all(fetchedNotifications.map(async (notification) => {
                    if (!notification.isRead) {
                        const notificationRef = doc(db, "notifications", notification.id);
                        await updateDoc(notificationRef, { isRead: true });
                    }
                }));
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setErrorMessage("Failed to fetch notifications.");
            }
        };

        fetchNotifications();
    }, [userId]);

    useEffect(() => {
        const timerIds = notifications.map((notification) => {
            if (notification.isNew) {
                return setTimeout(() => {
                    setNotifications((prevNotifications) =>
                        prevNotifications.map((n) =>
                            n.id === notification.id ? { ...n, isNew: false } : n
                        )
                    );
                }, 15000);
            }
            return null;
        });

        return () => {
            timerIds.forEach((id) => id && clearTimeout(id));
        };
    }, [notifications]);

    if (errorMessage) {
        return <div>{errorMessage}</div>;
    }

    if (notifications.length === 0) {
        return <div>No notifications found.</div>;
    }

    const handleNotificationClick = (notification) => {
        navigate('/status', { state: { notification } }); // Pass notification data as state
    };

    return (
        <Container>
            <h2>Your Notifications</h2>
            <Grid container spacing={2} direction="column">
                {notifications.map((notification) => (
                    <Grid item xs={12} key={notification.id}>
                        <Paper
                            onClick={() => handleNotificationClick(notification)} // Add onClick handler
                            style={{
                                padding: '16px',
                                backgroundColor: notification.isNew ? '#2196F3' : (notification.isRead ? '#f0f0f0' : '#ffffff'),
                                border: '1px solid #e0e0e0',
                                color: notification.isNew ? '#fff' : '#000',
                                cursor: 'pointer', // Change cursor to indicate it's clickable
                            }}
                        >
                            <Typography variant="h6">{notification.message}</Typography>
                            <Typography variant="body2">{notification.status}</Typography>
                            <Typography variant="caption">{notification.timestamp?.toDate().toString()}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Notifications;
