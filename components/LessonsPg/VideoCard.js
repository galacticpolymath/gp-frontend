/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import EllipsisTxt from '../Text/EllipsisTxt';
import CustomLink from '../CustomLink';
import { getMediaComponent as Thumbnail } from '../LessonSection/Preview/utils';
import { useEffect, useRef } from 'react';
import Button from '../General/Button';
import ForLessonTxtWrapper from './ForLessonTxtWrapper';
import ForLessonTxt from './ForLessonTxt';
import { UNITS_URL_PATH } from '../../shared/constants';

const VideoCard = ({
    videoObj,
    setSelectedVideo,
    setIsGpVideoModalShown,
    cardClassName = 'd-flex flex-column justify-content-between py-3 px-4 position-relative w-100 g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid rounded-3 bg-white lessonsPgShadow',
    style = {},
}) => {
    let href = videoObj.lessonNumId ? `/${UNITS_URL_PATH}/en-US/${videoObj.unitNumId}#lesson_part_${videoObj.lessonNumId}` : `/${UNITS_URL_PATH}/en-US/${videoObj.unitNumId}`;
    const videoCardRef = useRef();
    const unitTitle = ['.', '!'].includes(videoObj.lessonUnitTitle.split('').at(-1)) ? videoObj.lessonUnitTitle : `${videoObj.lessonUnitTitle}.`;

    const handleOnClick = () => {
        setSelectedVideo({
            href,
            link: videoObj.mainLink,
            description: videoObj.description,
            title: videoObj.videoTitle,
            unitTitle: videoObj.lessonUnitTitle,
            lessonNumId: videoObj.lessonNumId,
        });
        setIsGpVideoModalShown(true);
    };

    useEffect(() => {
        if (videoObj.willScrollIntoView) {
            videoCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return (
        <div
            ref={videoCardRef}
            style={style}
            className={cardClassName}
        >
            <div>
                <div
                    style={{ height: '160px' }}
                    className='video-iframe-on-card'
                >
                    <Thumbnail
                        type="video"
                        mainLink={videoObj.mainLink}
                        iframeStyle={{ zIndex: 100, width: '100%', height: '100%', position: 'absolute' }}
                    />
                    <div
                        onClick={handleOnClick}
                        style={{ zIndex: 101 }}
                        className='position-absolute w-100 h-100 pointer'
                    />
                </div>
                <Button handleOnClick={handleOnClick} classNameStr='no-btn-styles w-100 d-flex'>
                    <CardTitle
                        className='text-start mt-3 vid-card-heading-txt w-light text-black mb-0 no-underline-on-hover video-card-test-text'
                    >
                        {videoObj.videoTitle}
                    </CardTitle>
                </Button>
                {videoObj?.description && (
                    <Button handleOnClick={handleOnClick} classNameStr='no-btn-styles w-100 d-flex'>
                        <EllipsisTxt
                            className='pointer text-start video-card-description'
                            ellipsisTxtNum={2}
                            style={{ marginTop: '6px' }}
                        >
                            {videoObj?.description}
                        </EllipsisTxt>
                    </Button>
                )}
            </div>
            <CustomLink
                color='#BFBFBF'
                className='no-link-decoration mt-3 underline-on-hover d-flex'
                hrefStr={href}
                style={{ lineHeight: '22px' }}
            >
                {videoObj.lessonNumId ?
                    <ForLessonTxtWrapper>
                        <ForLessonTxt
                            lessonNumId={videoObj.lessonNumId}
                            unitTitle={unitTitle}
                        />
                    </ForLessonTxtWrapper>
                    :
                    <ForLessonTxtWrapper>
                        <>Part of <em>{unitTitle}</em></>
                    </ForLessonTxtWrapper>
                }
            </CustomLink>
        </div>
    );
};

export default VideoCard;