/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable brace-style */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable semi */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Image from "next/image";
import { IoIosCloseCircle } from "react-icons/io";
import { ModalContext } from '../../../providers/ModalProvider';
import { useContext } from 'react';

const { Body, Footer, Header, Title } = Modal;

const DownloadTipModal = () => {
    const { _isDownloadModalInfoOn } = useContext(ModalContext);
    const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;

    const handleCloseModal = () => {
        setIsDownloadModalInfoOn(false);
    }

    return (
        <Modal show={isDownloadModalInfoOn} size="lg" onHide={handleCloseModal} contentClassName="" dialogClassName='downloadInfoModal' className='ps-2 pe-2'>
            <Header closeButton>
                <Title>
                    <h3>Download From Google Drive</h3>
                </Title>
            </Header>
            <Body className="d-flex p-3">
                <section className="d-flex flex-column w-50 pe-3 ps-3 pt-3">
                    <p className="downloadInfoModal-txt" style={{ height: "90px" }}>If logged into Google, click the dropdown menu on the folder containing handouts & presentations, and select download:</p>
                    <div className="position-relative" style={{height: "300px"}}>
                        <Image src="/imgs/lessons/download_large.png" alt="Galactic_Polymath_download_image_large" layout='fill' style={{ objectFit: 'contain' }} className="w-100 h-100" />
                    </div>
                </section>
                <section className="d-flex flex-column w-50 pe-3 ps-3 pt-3">
                    <p className="downloadInfoModal-txt" style={{ height: "90px" }}>
                        If not logged into Google, click this icon in the upper right:
                    </p>
                    <div className="position-relative w-100" style={{height: "150px" }}>
                        <Image src="/imgs/lessons/download_small.png" className="w-100 h-100" alt="Galactic_Polymath_download_image_large" layout='fill' style={{ objectFit: 'contain' }} />
                    </div>
                </section>
            </Body>
            <Footer>
                <Button variant="secondary" onClick={handleCloseModal} className="closeButtonBackgroundColor fw300">OKAY!</Button>
            </Footer>
        </Modal>
    )
}

export default DownloadTipModal;
