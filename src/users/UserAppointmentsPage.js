import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc,getDoc,deleteDoc,getDocs } from "firebase/firestore";
import Cookies from "js-cookie";
import { app } from "../firebase"; 

const UserAppointmentsPage = () => {
    const [userAppointments, setUserAppointments] = useState([]);

    const fetchServiceName = async (serviceId) => {
        const db = getFirestore(app);
        const serviceDocRef = doc(db, "services", serviceId);
        try {
            const docSnap = await getDoc(serviceDocRef);
            if (docSnap.exists()) {
                return docSnap.data().name; // Assuming the service has a 'name' field
            } else {
                return "Unknown Service";
            }
        } catch (err) {
            console.error("Error fetching service name: ", err);
            return "Unknown Service";
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        const db = getFirestore(app);
        const appointmentDocRef = doc(db, "appointments", appointmentId);

        try {
            // Delete the appointment from Firestore
            await deleteDoc(appointmentDocRef);
            alert("You have successfully cancelled the appointment.");
        } catch (err) {
            console.error("Error canceling appointment: ", err);
            alert("Failed to cancel the appointment. Please try again.");
        }
    };

    // Update appointments to mark them as read when the user visits the page
    const markAppointmentsAsRead = async () => {
        const db = getFirestore(app);
        const appointmentsRef = collection(db, "appointments");
        const userId = Cookies.get("user_id");

        if (!userId) return;

        const q = query(appointmentsRef, where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (docSnap) => {
            const appointmentDocRef = doc(db, "appointments", docSnap.id);
            await updateDoc(appointmentDocRef, {
                isRead: true, // Mark all appointments as read
            });
        });
    };

    useEffect(() => {
        const db = getFirestore(app);
        const appointmentsRef = collection(db, "appointments");
        const userId = Cookies.get("user_id");

        if (!userId) {
            alert("User is not logged in.");
            return;
        }

        const q = query(appointmentsRef, where("user_id", "==", userId));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const userAppointmentsData = [];

            for (const docSnap of querySnapshot.docs) {
                const appointmentData = docSnap.data();
                const serviceName = await fetchServiceName(appointmentData.serviceId);

                userAppointmentsData.push({
                    id: docSnap.id,
                    serviceId: appointmentData.serviceId,
                    serviceName,
                    ...appointmentData,
                });
            }

            setUserAppointments(userAppointmentsData); // Set state with real-time data
            markAppointmentsAsRead(); // Mark all appointments as read
        }, (err) => {
            console.error("Error fetching appointments: ", err);
        });

        return () => unsubscribe();

    }, []);

    return (
        <div>
            <h1>Your Appointments</h1>
            {userAppointments.length > 0 ? (
                userAppointments.map((appointment) => (
                    <div key={appointment.id}>
                        <h3>Appointment for: {appointment.serviceName}</h3>
                        <p>
                            <strong>Status:</strong> {appointment.status || "Pending"}
                            <br />
                            <strong>Appointment on:</strong> {appointment.date}
                            <br />
                            <strong>Time:</strong> {appointment.time}
                        </p>
                        <button onClick={() => handleCancelAppointment(appointment.id)}>Cancel Appointment</button>
                    </div>
                ))
            ) : (
                <p>No scheduled appointments.</p>
            )}
        </div>
    );
};

export default UserAppointmentsPage;
