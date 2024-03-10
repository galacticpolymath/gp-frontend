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
import CustomLink from '../CustomLink';
import { useEffect } from 'react';

const { Title } = Modal;

const SelectedGpWebApp = ({ _selectedGpWebApp, _isModalShown }) => {
    const [isModalShown, setIsModalShown] = _isModalShown;
    const [selectedGpWebApp, setSelectedGpWebApp] = _selectedGpWebApp;

    const handleOnHide = () => {
        setIsModalShown(false);
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
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='selected-gp-web-app-content'
        >
            <div className='modal-content-wrapper-gp-web-app'>
                <div className='modal-content-sub-wrapper-gp-web-app position-relative'>
                    <div className='d-flex justify-content-end pe-1 bg-danger' style={{ height: '28px', paddingBottom: '1.8em' }}>
                        <Button
                            handleOnClick={handleOnHide}
                            classNameStr='no-btn-styles close-gp-vid-modal-btn'
                        >
                            <GiCancel color='grey' className='close-gp-video-modal-icon' />
                        </Button>
                    </div>
                    <div
                        className={`w-100 ${selectedGpWebApp?.cssClassName}`}
                    >
                        <iframe
                            id='web-app-iframe'
                            className='w-100 h-100'
                            src={selectedGpWebApp?.pathToFile}
                        />
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
                            className='mt-2 no-link-decoration underline-on-hover'
                            color='#75757D'
                            targetLinkStr='_blank'
                        >
                            Open in new window
                        </CustomLink>
                        <CustomLink
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