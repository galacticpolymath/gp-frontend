/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */

import { useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import { ModalContext } from "../../providers/ModalProvider";

const Notify = () => {
    const { _notifyModal } = useContext(ModalContext);
    const [notifyModal, setNotifyModal] = _notifyModal;
    const { bodyTxt, headerTxt } = notifyModal;

    const closeModal = () => {
        setNotifyModal({ isDisplayed: false, bodyTxt: '', headerTxt: '' });
    };

    return (
        <Modal
            size="md"
            show={notifyModal.isDisplayed}
            onHide={closeModal}
            aria-labelledby="example-modal-sizes-title-sm"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-sm" className="text-center w-100">
                    {headerTxt}
                </Modal.Title>
            </Modal.Header>
            {bodyTxt && (
                <Modal.Body>
                    {bodyTxt}
                </Modal.Body>
            )}
            <Modal.Footer>
                <Button onClick={closeModal} className="px-3 py-1">
                    CLOSE
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Notify;