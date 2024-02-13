/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import Modal from 'react-bootstrap/Modal';
import { getMediaComponent as Video } from '../../LessonSection/Preview/utils';
import { useEffect } from 'react';

const { Header, Body, Title } = Modal;

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

    return (
        <Modal
            show={isModalShown}
            className='d-flex justify-content-center align-items-center h-100'
            dialogClassName='selected-vid-dialog m-0'
            contentClassName='selected-vid-modal-content'
        >
            <Header
                className='d-flex flex-column-reverse justify-content-center align-items-center'
                closeButton
                onHide={handleOnHide}
            >
                <Title style={{ width: '90%' }} className='mt-5'>
                    {selectedVideo?.title}
                </Title>
                <div style={{ height: '450px', width: '90%' }} className='position-relative pt-5'>
                    <Video
                        type='video'
                        mainLink={`${selectedVideo?.link}?autoplay=1`}
                        iframeStyle={{ width: '100%', height: '100%', position: 'absolute' }}
                    />
                </div>
            </Header>
            <Body className='d-flex justify-content-center mt-1 pt-0'>
                <div style={{ width: '90%' }}>
                    <h5><i>Description: </i></h5>
                    <p style={{ lineHeight: '23px' }}>
                        {selectedVideo?.description}
                    </p>
                </div>
            </Body>
        </Modal>
    );
};

export default SelectedGpVideo;