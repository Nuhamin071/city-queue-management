import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Cookies from "js-cookie"; 
import { app } from "../firebase"; 

const UserAppointmentsPage = () => {
    const [userAppointments, setUserAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserAppointments = async () => {
        const db = getFirestore(app);
        const appointmentsRef = collection(db, "appointments");
        const userId = Cookies.get("user_id");

        if (!userId) {
            setError("User is not logged in.");
            setLoading(false);
            return;
        }

        try {
            const querySnapshot = await getDocs(appointmentsRef);
            const userAppointmentsData = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.user_id === userId) {
                    userAppointmentsData.push({
                        id: doc.id,
                        ...data,
                    });
                }
            });

            // Update isRead field for all fetched appointments
            await Promise.all(userAppointmentsData.map(async (appointment) => {
                const appointmentRef = doc(db, "appointments", appointment.id);
                await updateDoc(appointmentRef, { isRead: true }); // Set isRead to true
            }));

            setUserAppointments(userAppointmentsData);
        } catch (err) {
            setError("Failed to fetch appointments. Please try again.");
            console.error("Error fetching appointments: ", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserAppointments();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Your Appointments</h1>
            {userAppointments.length > 0 ? (
                userAppointments.map((appointment) => (
                    <div key={appointment.id} style={{ marginBottom: "20px" }}>
                        <h3>Service: {appointment.serviceId}</h3>
                        <p>
                            <strong>Date:</strong> {appointment.day}
                            <br />
                            <strong>Time:</strong> {appointment.time}
                            <br />
                            {appointment.groomFullName && (
                                <>
                                    <strong>Groom:</strong> {appointment.groomFullName} <br />
                                    <strong>Bride:</strong> {appointment.brideFullName}
                                </>
                            )}
                        </p>
                    </div>
                ))
            ) : (
                <p>No scheduled appointments.</p>
            )}
        </div>
    );
};

export default UserAppointmentsPage;
