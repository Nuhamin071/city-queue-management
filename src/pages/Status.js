import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { db, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from '../firebase'; // Import Firestore functions
import Cookies from 'js-cookie';

const Status = () => {
    const [queueNumber, setQueueNumber] = useState('');
    const [status, setStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchQueueData = async () => {
            const userId = Cookies.get('user_id');
            console.log('user_ID:', userId);
            if (userId) {
                try {
                    const queueRef = collection(db, 'queue');
                    const q = query(queueRef, where('user_id', '==', userId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            setQueueNumber(doc.id); // Assuming `doc.id` is the queueNumber
                            setStatus(data.status); // Assuming the queue document has a `status` field
                        });
                    } else {
                        console.log('No queue found for this user.');
                        setStatus('not_found');
                    }
                } catch (error) {
                    console.error('Error fetching queue data:', error.message);
                }
            } else {
                console.log('No user ID found in cookies.');
                setStatus('not_found');
            }
        };

        fetchQueueData();
    }, []);
    useEffect(() => {
        console.log('isModalOpen:', isModalOpen);  // Log to check if the modal is opening
    }, [isModalOpen]);  // This will trigger whenever the isModalOpen state changes
    

    useEffect(() => {
        console.log('Status updated:', status);
        if (status === 'called' || status === 'removed'|| status === 'not_found') {
            setIsModalOpen(true);
        }
    }, [status]);

    const handleRemoveMe = async () => {
        console.log('Remove Me Clicked');
        if (queueNumber) {
            try {
                const queueDocRef = doc(db, 'queue', queueNumber);
                await deleteDoc(queueDocRef);
                console.log('Queue document deleted');
                alert('You have been removed from the queue.');
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error removing user from queue:', error.message);
            }
        }
    };

    const handleWaitFiveMinutes = async () => {
        console.log('Wait Five Minutes Clicked');
        if (queueNumber) {
            try {
                const queueDocRef = doc(db, 'queue', queueNumber);
                await updateDoc(queueDocRef, { isWait: true });
                console.log('Queue document updated with isWait');
                alert('You have chosen to wait for 5 more minutes.');
            } catch (error) {
                console.error('Error updating wait status:', error.message);
            }
        }
    };

    return (
        <div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {status === 'called' ? (
                    <div>
                        <h2>You are called!</h2>
                        <p>Your Queue Number: {queueNumber}</p>
                        <button onClick={handleRemoveMe}>Remove Me</button>
                        <button onClick={handleWaitFiveMinutes}>Wait Five Minutes</button>
                    </div>
                ) : status === 'removed' ? (
                    <div>
                        <h2>You have been removed.</h2>
                    </div>
                ) : status === 'not_found' ? (
                    <div>
                        <h2>You are not on a queue.</h2>
                    </div>
                ) : (
                    <div>
                        <h2>Unknown Status</h2>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Status;
