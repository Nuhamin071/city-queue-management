import React from 'react';
import "../styles/Modal.css"; // Move styles to a CSS file

const Modal = ({ isOpen, onClose, children }) => {
    const handleClose = () => {
        window.history.back();  // Navigate to the previous page
        onClose();  // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={handleClose}>×</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
