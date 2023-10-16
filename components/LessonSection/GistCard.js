import Image from "next/image";
import Link from "next/link";
import RichText from "../RichText";
import SubjectBreakDown from "./SubjectBreakDown";

const GistCard = ({
    LearningSummary,
    TargetSubject,
    ForGrades,
    EstLessonTime,
    SteamEpaulette,
    SteamEpaulette_vert,
    isOnPreview
}) => {
    return (
        <div className="bg-light-gray px-4 py-2 mt-4 rounded-3 text-center">
            {LearningSummary && (
                <div className="g-col-12 bg-white p-3 rounded-3 mt-2 text-start  align-items-center">
                    <Image
                        src="/imgs/gp_logo_gradient_transBG.png"
                        alt="Galactic_PolyMath_First_Sec_Mobile_Info"
                        style={{ objectFit: 'contain' }}
                        className="d-inline-flex me-2 mb-2"
                        height={30}
                        width={30}
                    />
                    <h5 className="d-inline-flex">The Gist:</h5>
                    <div>
                        <RichText content={LearningSummary} />
                    </div>
                </div>
            )}
            <div className="grid mx-auto gap-3 py-3 justify-content-center justify-content-sm-start">
                <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
                    <i className="fs-3 mb-2 d-block bi-book-half"></i>
                    <h5 id='selectedLessonTitle'>Target Subject: </h5>
                    <span>{TargetSubject}</span>
                </div>
                <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
                    <i className="fs-3 mb-2 d-block bi-person-circle"></i>
                    <h5>Grades: </h5>
                    <span>{ForGrades}</span>
                </div>
                <div className='d-none d-sm-grid g-col g-col-sm-4 bg-white pt-sm-3 pe-sm-4 pb-sm-3 ps-sm-2 p-md-3 rounded-3'>
                    <i className="fs-3 mb-2 d-block bi-alarm"></i>
                    <h5>Estimated Time: </h5>
                    <span>{EstLessonTime}</span>
                </div>
                <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
                    <div className='d-grid bg-white rounded-3 col-12 p-3'>
                        <i className="fs-3 mb-2 d-block bi-book-half"></i>
                        <h5>Target Subject: </h5>
                        <span>{TargetSubject}</span>
                    </div>
                </div>
                <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
                    <div className='d-grid bg-white rounded-3 col-12 p-3'>
                        <i className="fs-3 mb-2 d-block bi-person-circle"></i>
                        <h5>Grades: </h5>
                        <span>{ForGrades}</span>
                    </div>
                </div>
                <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
                    <div className='d-grid bg-white rounded-3 col-12 p-3'>
                        <i className="fs-3 mb-2 d-block bi-alarm"></i>
                        <h5>Estimated Time: </h5>
                        <span>{EstLessonTime}</span>
                    </div>
                </div>
            </div>
            {(SteamEpaulette && SteamEpaulette_vert) && (
                isOnPreview ?
                    <SubjectBreakDown 
                        SteamEpaulette={SteamEpaulette}
                        SteamEpaulette_vert={SteamEpaulette_vert}
                    />
                    :
                    <Link passHref href="#learning_standards">
                        <SubjectBreakDown 
                            SteamEpaulette={SteamEpaulette}
                            SteamEpaulette_vert={SteamEpaulette_vert}
                        />
                    </Link>
            )}
        </div>
    );
};

export default GistCard;
