/* eslint-disable no-debugger */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import { format } from 'date-fns';
import Image from 'next/image';
import Layout from '../../../../../components/Layout';
import RichText from '../../../../../components/RichText';
import LocDropdown from '../../../../../components/LocDropdown';
import ParentLessonSection from '../../../../../components/LessonSection/ParentLessonSection';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Lessons from '../../../../../backend/models/lesson';
import { connectToMongodb } from '../../../../../backend/utils/connection';
import { getLinkPreview } from "link-preview-js";
import { useInView } from 'react-intersection-observer';
import GistCard from '../../../../../components/LessonSection/GistCard';
import LessonPartBtn from '../../../../../components/LessonSection/TeachIt/LessonPartBtn';
import { FiExternalLink } from 'react-icons/fi';
import QRCode from "react-qr-code";

// let QRBarCode;
// try {
//     QRBarCode = require("react-qr-barcode-scanner");
//     console.log('QRBarCode: ', QRBarCode)

// } catch(error){
//     console.log('error: ', error)
// }   

const getLatestSubRelease = (sections) => {
    const versionSection = sections.versions;

    if (!versionSection) return null;

    const lastRelease = versionSection.Data[versionSection?.Data?.length - 1].sub_releases;
    const lastSubRelease = lastRelease[lastRelease?.length - 1];

    return lastSubRelease;
};

const getSectionTitle = (sectionComps, sectionTitle) => {
    const targetSectionTitleIndex = sectionComps.findIndex(({ SectionTitle }) => SectionTitle === sectionTitle);

    if (targetSectionTitleIndex === -1) return -1;

    return `${targetSectionTitleIndex + 1}. ${sectionTitle}`
}

const removeHtmlTags = str => str.replace(/<[^>]*>/g, '');



// <div className="px-5 px-5m-4 container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
// <div className="col-11 col-md-10 p-0">
// </div>
// </div>

/* <div className='row mt-4 d-flex flex-column flex-sm-row align-content-center'>
                            <div className="col-12 col-sm-8 col-md-8 col-lg-9 d-grid">
                                <h5>Sponsored by:</h5>
                                <RichText content={lesson.SponsoredBy} />
                            </div>
                            <div className="col-6 col-sm-4 col-md-4 col-lg-3 m-auto d-grid">
                                {sponsorLogoImgUrl && (
                                    <div style={{ height: "180px" }} classNpame='position-relative sponsorImgContainer d-sm-block d-flex justify-content-center align-items-center w-100'>
                                        <Image
                                            src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                                            alt={lesson.Subtitle}
                                            className='sponsorImg'
                                            sizes="225px"
                                            fill
                                            style={{ width: "100%", objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div> */

const LessonDetails = ({ lesson }) => {
    console.log("lesson: ", lesson);
    const router = useRouter();
    const { ref } = useInView({ threshold: 0.2 });
    let sectionComps = null;

    if (lesson) {
        sectionComps = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
        sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
        sectionComps = sectionComps.filter(({ SectionTitle }) => !!SectionTitle)
    }

    if (!lesson && typeof window === "undefined") {
        return null;
    }

    if (!lesson) {
        router.replace('/error');
        return null;
    }

    const { CoverImage, LessonBanner } = lesson;
    const lessonBannerUrl = CoverImage?.url ?? LessonBanner

    const sponsorLogoImgUrl = lesson?.SponsorImage?.url?.length ? lesson?.SponsorImage?.url : lesson.SponsorLogo
    const layoutProps = {
        title: `Mini-Unit: ${lesson.Title}`,
        description: lesson?.Section?.overview?.LearningSummary ? removeHtmlTags(lesson.Section.overview.LearningSummary) : `Description for ${lesson.Title}.`, imgSrc: lessonBannerUrl, url: lesson.URL, imgAlt: `${lesson.Title} cover image`
    }
    let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

    if (lessonParts?.length) {
        lessonParts = lessonParts.filter(({ lsn }) => lsn !== 'last');
    }

    return (
        <div>
            <div style={{ maxWidth: 'none' }} className="container w-100 d-flex py-0 m-0 ps-2 pe-0">
                <div className="d-flex col-8">
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
                        </div>
                        <h1 id="lessonTitleId" ref={ref} className="mt-2">{lesson.Title}</h1>
                        <h4 className='fw-light'>{lesson.Subtitle}</h4>
                        {lessonBannerUrl && (
                            <div className='w-100 position-relative mt-2 mb-2'>
                                <Image
                                    src={lessonBannerUrl}
                                    alt={lesson.Subtitle}
                                    width={1500}
                                    height={450}
                                    priority
                                    style={{ width: "100%", height: "auto", objectFit: 'contain' }}
                                />
                            </div>
                        )}
                        <GistCard
                            isOnPreview
                            EstLessonTime={lesson.EstLessonTime}
                            ForGrades={lesson.ForGrades}
                            LearningSummary={lesson?.Section?.overview?.LearningSummary}
                            TargetSubject={lesson.TargetSubject}
                            SteamEpaulette={lesson?.Section?.overview?.SteamEpaulette}
                            SteamEpaulette_vert={lesson?.Section?.overview?.SteamEpaulette_vert}
                        />
                    </div>
                </div>
                <div className='col-4 d-flex flex-column justify-content-center align-items-center position-relative'>
                    <div style={{ top: 0, right: 0, borderBottomLeftRadius: "30px", backgroundColor: '#E1E2E3', width: "90%" }} className="ps-2 position-absolute d-flex qrCodeImgAndTxtContainer">
                        <section style={{ bottom: "40px" }} className='w-50 d-flex justify-content-center align-items-center flex-column'>
                            <div className='mt-3 mt-lg-0 w-100 d-flex justify-content-center align-items-center'>
                                <FiExternalLink
                                    size={25}
                                    style={{
                                        transform: 'scale(1.5)',
                                    }}
                                    color='black'
                                    className='ms-2'
                                />
                            </div>
                            <p style={{ lineHeight: "25px" }} className='mt-1 mt-lg-2 text-center px-1 px-lg-4'>Click or Scan for Access.</p>
                        </section>
                        <section className='w-50 p-2 d-flex justify-content-start align-items-stretch'>
                            <div className='position-relative d-flex justify-content-center align-items-center w-100'>
                                <QRCode
                                    value='hey'
                                    className='qrCodeContainer position-absolute'
                                />
                            </div>
                        </section>
                    </div>
                    <div>
                        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
                            <h5 className="w-100 text-center mb-3">Sponsored by: </h5>
                            <div className="w-100 d-flex justify-content-center align-items-center">
                                {sponsorLogoImgUrl && (
                                    <div style={{ height: 130, width: 130 }} className='position-relative d-flex justify-content-center align-items-center'>
                                        <Image
                                            src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                                            alt={lesson.Subtitle}
                                            className='position-absolute'
                                            sizes="225px"
                                            fill
                                            style={{
                                                objectFit: 'contain',
                                                width: '100%',
                                                height: "100%"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 w-100 d-flex justify-content-center align-items-center">
                            <div className="w-75">
                                <RichText content={lesson.SponsoredBy} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="px-2"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '.5rem',
                    gridAutoColumns: 'column'
                }}
            >
                {lessonParts.map(lessonPart => {
                    console.log('lessonPart: ', lessonPart)
                    let {
                        lsn,
                        lsnNum,
                        lsnTitle,
                        partTitle,
                        title,
                        lsnPreface,
                        partPreface,
                        preface,
                        chunks,
                        learningObj,
                        itemList,
                        lessonTile,
                        tile,
                        lsnExt,
                        tags,
                    } = lessonPart;

                    tags = Array.isArray(tags[0]) ? tags[0] : tags;

                    return (
                        <LessonPartBtn
                            isLessonPreview
                            lsnNum={lsn}
                            lsnTitle={title}
                            lsnPreface={preface}
                            lessonTileUrl={tile}
                            previewTags={tags}
                            lessonPartTxtContainerClassName='d-flex position-relative flex-column justify-content-between w-100 align-items-stretch mt-0'
                            imgContainerDimensionObj={{ width: 100, height: 100 }}
                            parentDivProps={{ className: 'pt-3 pb-2 w-100 bg-white d-flex flex-row' }}
                            tileImgAndLessonInfoContainerClassName='d-flex h-100 justify-content-between w-100 position-relative flex-row-reverse'
                        />
                    )
                })}
            </div>
        </div>
    );
};

export const getStaticPaths = async () => {
    try {
        await connectToMongodb();

        const lessons = await Lessons.find({}, { numID: 1, locale: 1, _id: 0 }).lean()

        return {
            paths: lessons.map(({ numID, locale }) => ({
                params: { id: `${numID}`, loc: `${locale}` },
            })),
            fallback: false,
        };
    } catch (error) {
        console.error('An error has occurred in getting the available paths for the selected lesson page. Error message: ', error)
    }
};

async function getLinkPreviewObj(url) {
    try {
        const linkPreviewObj = await getLinkPreview(url);

        return linkPreviewObj;
    } catch (error) {
        const errMsg = `An error has occurred in getting the link preview for given url. Error message: ${error}.`;
        console.error(errMsg);

        return { errMsg }
    }
}

export const getStaticProps = async ({ params: { id, loc } }) => {
    try {
        await connectToMongodb();

        const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
        const targetLessonLocales = targetLessons.map(({ locale }) => locale)
        let lessonToDisplayOntoUi = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)))
        const multiMediaArr = lessonToDisplayOntoUi?.Section?.preview?.Multimedia;

        if (multiMediaArr?.length && multiMediaArr.some(({ type }) => type === 'web-app')) {
            let multiMediaArrUpdated = []

            for (let numIteration = 0; numIteration < multiMediaArr.length; numIteration++) {
                let multiMediaItem = multiMediaArr[numIteration]

                if (multiMediaItem.type === 'web-app') {
                    const { errMsg, images, title } = await getLinkPreviewObj(multiMediaItem.mainLink)

                    if (errMsg && !images?.length) {
                        console.error('Faild to get the image preview of web app. Error message: ', errMsg)
                    }

                    multiMediaItem = {
                        ...multiMediaItem,
                        webAppPreviewImg: (errMsg || !images?.length) ? null : images[0],
                        webAppImgAlt: (errMsg || !images?.length) ? null : `${title}'s preview image`,
                    }
                }

                multiMediaArrUpdated.push(multiMediaItem)
            }

            lessonToDisplayOntoUi = {
                ...lessonToDisplayOntoUi,
                Section: {
                    ...lessonToDisplayOntoUi?.Section,
                    preview: {
                        ...lessonToDisplayOntoUi?.Section?.preview,
                        Multimedia: multiMediaArrUpdated,
                    },
                },
            }
        }

        return {
            props: {
                lesson: JSON.parse(JSON.stringify(lessonToDisplayOntoUi)),
                availLocs: targetLessonLocales,
            },
        };
    } catch (error) {
        console.error('Faild to get lesson. Error message: ', error)

        return {
            props: {
                lesson: null,
                availLocs: null,
            },
        }
    }
};

export default LessonDetails;