/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-multiple-empty-lines */
import Modal from 'react-bootstrap/Modal';
import { GiCancel } from 'react-icons/gi';
import Button from '../General/Button';
import { useEffect, useState } from 'react';
import CustomLink from '../CustomLink';

const { Title } = Modal;

const SelectedGpWebApp = ({ _selectedGpWebApp, _isModalShown }) => {
    const [isModalShown, setIsModalShown] = _isModalShown;
    const [isOverImg, setIsOverImg] = useState(false)
    const [selectedGpWebApp, setSelectedGpWebApp] = _selectedGpWebApp;

    const handleOnHide = () => {
        setIsModalShown(false);
    };

    const handleOnMouseOver = () => {
        setIsOverImg(true)
    };

    const handleOnMouseLeave = () => {
        setIsOverImg(false)
    };

    useEffect(() => {
        if (!isModalShown) {
            setTimeout(() => {
                setSelectedGpWebApp(null);
            }, 250);
        }
    }, [isModalShown]);

    useEffect(() => {
        const listenForEscKeyPress = window.addEventListener('keyup', event => {
            if (event.key === 'Escape') {
                handleOnHide();
            }
        });

        return () => {
            window.removeEventListener('keyup', listenForEscKeyPress);
        };
    }, []);

    return (
        <Modal
            show={isModalShown}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='selected-gp-web-app-content'
        >
            <div className='modal-content-wrapper-gp-web-app'>
                <div className='modal-content-sub-wrapper-gp-web-app position-relative'>
                    <div className='d-flex justify-content-end pe-1' style={{ height: '28px', paddingBottom: '1.8em' }}>
                        <Button
                            handleOnClick={handleOnHide}
                            classNameStr='no-btn-styles close-gp-vid-modal-btn'
                        >
                            <GiCancel color='grey' className='close-gp-video-modal-icon' />
                        </Button>
                    </div>
                    <div
                        className='position-relative web-app-img-container w-100'
                        onMouseOver={handleOnMouseOver}
                        onMouseLeave={handleOnMouseLeave}
                    >
                        <div
                            className='position-relative h-100'
                        >
                            <img
                                src={selectedGpWebApp?.pathToFile}
                                alt='Image of GP web-app.'
                                style={{ objectFit: 'contain' }}
                                className='h-100 position-absolute'
                            />
                            {isOverImg && (
                                <div className='h-100 w-100 position-relative d-flex justify-content-center align-items-center'>
                                    <CustomLink
                                        hrefStr={selectedGpWebApp?.webAppLink}
                                        className='no-link-decoration w-100 h-100 position-absolute pointer d-flex justify-content-center align-items-center'
                                        color='white'
                                        targetLinkStr='_blank'
                                        fontSize={24}
                                        style={{ backgroundColor: 'black', opacity: .4 }}
                                    />
                                    <span style={{ zIndex: 10 }} className='underline-on-hover text-white click-to-open-txt'>
                                        Click to open app in new window.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        style={{ borderTop: 'solid 1.5px rgb(222, 226, 230)' }}
                        className='px-3 px-sm-5 pt-3 d-flex flex-column pb-5 position-relative'
                    >
                        <Title>
                            {selectedGpWebApp?.title}
                        </Title>
                        <span className='mt-2'>{selectedGpWebApp?.description}</span>
                        <CustomLink
                            hrefStr={selectedGpWebApp?.webAppLink}
                            style={{ width: 'fit-content' }}
                            className='mt-2 no-link-decoration underline-on-hover'
                            color='#75757D'
                            targetLinkStr='_blank'
                        >
                            Open in new window
                        </CustomLink>
                        <CustomLink
                            style={{ width: 'fit-content' }}
                            hrefStr={`/lessons/en-US/${selectedGpWebApp?.unitNumID}`}
                            className='mt-2 no-link-decoration underline-on-hover'
                            color='#75757D'
                        >
                            <>
                                for Lesson {selectedGpWebApp?.lessonIdStr} of <i>{selectedGpWebApp?.unitTitle}</i>
                            </>
                        </CustomLink>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SelectedGpWebApp;