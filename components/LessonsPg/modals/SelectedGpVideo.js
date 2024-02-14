/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import Modal from 'react-bootstrap/Modal';
import Button from '../../General/Button';
import { getMediaComponent as Video } from '../../LessonSection/Preview/utils';
import { useEffect } from 'react';
import { GiCancel } from 'react-icons/gi';

const { Body, Title } = Modal;

const SelectedGpVideo = ({ _selectedVideo, _isModalShown }) => {
    const [selectedVideo, setSelectedVideo] = _selectedVideo;
    const [isModalShown, setIsModalShown] = _isModalShown;

    const handleOnHide = () => {
        setIsModalShown(false);
    };

    useEffect(() => {
        if (!isModalShown) {
            setTimeout(() => {
                setSelectedVideo(null);
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
            dialogClassName='selected-vid-dialog m-0'
            contentClassName='selected-vid-modal-content'
        >
            <div className='modal-content-wrapper'>
                <div className='modal-content-sub-wrapper'>
                    <div
                        className='position-relative w-100'
                    >
                        <Button
                            handleOnClick={handleOnHide}
                            classNameStr='no-btn-styles'
                            defaultStyleObj={{ position: 'absolute', right: 7 }}
                        >
                            <GiCancel color='grey' />
                        </Button>
                        <div className='d-flex w-100 h-100 flex-column-reverse justify-content-center align-items-center pt-4'>
                            <Title className='gp-video-title'>
                                {selectedVideo?.title}
                            </Title>
                            <div style={{ width: '90%' }} className='position-relative selected-vid-container-iframe'>
                                <Video
                                    type='video'
                                    mainLink={`${selectedVideo?.link}?autoplay=1`}
                                    iframeStyle={{ width: '100%', height: '100%', position: 'absolute' }}
                                />
                            </div>
                        </div>
                    </div>
                    <Body className='d-flex justify-content-center mt-1 p-0'>
                        <div style={{ width: '90%' }}>
                            <h5><i>Description: </i></h5>
                            <p style={{ lineHeight: '23px', wordBreak: 'break-word' }}>
                                {selectedVideo?.description ?? `Video part of ${selectedVideo?.unitTitle}.`}
                            </p>
                        </div>
                    </Body>
                </div>
            </div>
        </Modal>
    );
};

export default SelectedGpVideo;