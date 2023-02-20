/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ModalContext } from '../../providers/ModalProvider';

const { Header, Title, Body, Footer } = Modal;

const SelectedJob = () => {
    const { _selectedJob } = useContext(ModalContext);
    const [selectedJob, setSelectedJob] = _selectedJob;
    const { soc_title, def } = selectedJob;

    const handleOnHide = () => {
        setSelectedJob(null);
    }

    return (
        <Modal show={selectedJob} onHide={handleOnHide} contentClassName="selectedJobModal">
            <Title>
                <h3>{soc_title}</h3>
            </Title>
        </Modal>
    )
}

export default SelectedJob;