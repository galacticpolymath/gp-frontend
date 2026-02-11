 
 
 
 
import Modal from 'react-bootstrap/Modal';
import Button from '../../General/Button';
import { getMediaComponent as Video } from '../../LessonSection/Preview/utils';
import { useEffect } from 'react';
import { GiCancel } from 'react-icons/gi';
import { FiShare2 } from 'react-icons/fi';
import CustomLink from '../../CustomLink';
import ForLessonTxt from '../ForLessonTxt';
import ForLessonTxtWrapper from '../ForLessonTxtWrapper';
import { toast } from 'react-hot-toast';

const { Body, Title } = Modal;

const SelectedGpVideo = ({ _selectedVideo, _isModalShown }) => {
    const [selectedVideo, setSelectedVideo] = _selectedVideo;
    const [isModalShown, setIsModalShown] = _isModalShown;
    const unitTitle = ['.', '!'].includes(selectedVideo?.unitTitle?.split('')?.at(-1)) ? selectedVideo?.unitTitle : `${selectedVideo?.unitTitle}.`;
    const buildShareableLink = (link) => {
        if (!link) return '';
        try {
            const url = new URL(link);
            const hostname = url.hostname.replace(/^www\./, '');
            if (hostname.includes('youtube') || hostname === 'youtu.be') {
                let id = '';
                if (url.pathname.startsWith('/embed/')) {
                    id = url.pathname.split('/embed/')[1]?.split('/')[0] ?? '';
                } else if (hostname === 'youtu.be') {
                    id = url.pathname.replace('/', '').split('/')[0] ?? '';
                } else {
                    id = url.searchParams.get('v') ?? '';
                }
                const time = url.searchParams.get('t') || url.searchParams.get('start');
                if (id) {
                    return `https://youtu.be/${id}${time ? `?t=${time}` : ''}`;
                }
            }
            if (hostname.includes('vimeo.com') && url.pathname.includes('/video/')) {
                const id = url.pathname.split('/video/')[1]?.split('/')[0];
                if (id) return `https://vimeo.com/${id}`;
            }
            url.searchParams.delete('autoplay');
            return url.toString();
        } catch (error) {
            return link;
        }
    };

    const handleCopyLink = async () => {
        const shareLink = buildShareableLink(selectedVideo?.link);
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            toast.success('Link Copied');
            return;
        } catch (error) {
            // Fall back to a basic copy method.
        }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = shareLink;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            toast.success('Link Copied');
        } catch (error) {
            toast.error('Unable to copy link');
        }
    };

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
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='selected-gp-web-app-content'
        >
            <div className='modal-content-wrapper-gp-web-app'>
                <div className='modal-content-sub-wrapper-gp-web-app position-relative'>
                    <div className='position-relative w-100'>
                        <Button
                            handleOnClick={handleOnHide}
                            classNameStr='no-btn-styles close-gp-vid-modal-btn position-absolute'
                        >
                            <GiCancel color='grey' className='close-gp-video-modal-icon' />
                        </Button>
                        <div className='d-flex w-100 h-100 flex-column-reverse justify-content-center align-items-center pt-4'>
                            <Title id="" className='gp-modal-title'>
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
                            <div className='d-flex justify-content-end'>
                                <button
                                    type='button'
                                    className='btn btn-outline-secondary d-inline-flex align-items-center gap-2'
                                    onClick={handleCopyLink}
                                >
                                    <FiShare2 aria-hidden='true' />
                                    Copy Link to Clipboard
                                </button>
                            </div>
                            <h5><i>Description: </i></h5>
                            <p style={{ lineHeight: '23px', wordBreak: 'break-word' }}>
                                {selectedVideo?.description ?? <> Video part of {selectedVideo?.unitTitle?.includes('!') ? selectedVideo?.unitTitle : `${selectedVideo?.unitTitle}.`}</>}
                            </p>
                            <CustomLink
                                color='#BFBFBF'
                                className='no-link-decoration mt-3 underline-on-hover d-flex'
                                hrefStr={selectedVideo?.href ?? ''}
                                style={{ lineHeight: '22px' }}
                            >
                                {selectedVideo && (
                                    selectedVideo.lessonNumId ?
                                        <ForLessonTxtWrapper>
                                            <ForLessonTxt
                                                lessonNumId={selectedVideo.lessonNumId}
                                                unitTitle={unitTitle}
                                            />
                                        </ForLessonTxtWrapper>
                                        :
                                        <ForLessonTxtWrapper>
                                            <>Part of <em>{unitTitle}</em></>
                                        </ForLessonTxtWrapper>
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
