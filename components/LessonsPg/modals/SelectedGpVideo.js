/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import Modal from 'react-bootstrap/Modal';
import Button from '../../General/Button';
import { getMediaComponent as Video } from '../../LessonSection/Preview/utils';
import { useEffect } from 'react';
import { GiCancel } from 'react-icons/gi';
import CustomLink from '../../CustomLink';

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
                    <div className='position-relative w-100'>
                        <Button
                            handleOnClick={handleOnHide}
                            classNameStr='no-btn-styles close-gp-vid-modal-btn position-absolute'
                        >
                            <GiCancel color='grey' className='close-gp-video-modal-icon' />
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
                    <Body className='d-flex justify-content-center mt-1 pt-0 ps-0 pe-0 pb-3'>
                        <div style={{ width: '90%' }}>
                            <h5><i>Description: </i></h5>
                            <p style={{ lineHeight: '23px', wordBreak: 'break-word' }}>
                                {selectedVideo?.description ?? <> Video part of {selectedVideo?.unitTitle?.includes('!') ? selectedVideo?.unitTitle : `${selectedVideo?.unitTitle}.`}</>}
                            </p>
                            <CustomLink
                                color='#BFBFBF'
                                className='no-link-decoration mt-3 underline-on-hover'
                                hrefStr={selectedVideo?.href ?? ''}
                                style={{ lineHeight: '22px' }}
                            >
                                {selectedVideo && (
                                    selectedVideo.lessonNumId ?
                                        <>
                                            For Lesson {selectedVideo.lessonNumId} of <em>{['.', '!'].includes(selectedVideo.unitTitle.split('').at(-1)) ? selectedVideo.unitTitle : `${selectedVideo.unitTitle}.`}</em>
                                        </>
                                        :
                                        <>Part of <em>{['.', '!'].includes(selectedVideo.unitTitle.split('').at(-1)) ? selectedVideo.unitTitle : `${selectedVideo.unitTitle}.`}</em></>
                                )}
                            </CustomLink>
                        </div>
                    </Body>
                </div>
            </div>
        </Modal>
    );
};

export default SelectedGpVideo;