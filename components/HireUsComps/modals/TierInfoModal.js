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
import ReactPlayer from 'react-player';
import { IoIosCloseCircle } from "react-icons/io";

const { Header, Title, Body, Footer } = Modal;

const TierInfoModal = ({ tierModalInfo, setTiersInfoForModalArr, index }) => {
    const { isModalOn, title, texts, videoLink } = tierModalInfo;
    const isOnGPLearningExpModal = index === 0;

    const handleCloseModal = () => {
        setTiersInfoForModalArr(tiersInfoForModalArr => tiersInfoForModalArr.map(tier => ({ ...tier, isModalOn: false })))
    }

    return (
        <Modal show={isModalOn} onHide={handleCloseModal} contentClassName="tierInfoModal shadow">
        {/* flex-column-reverse flex-sm-row */}
            <Header className="tierInfoModalHeader pe-4 border-bottom d-flex pt-4 position-relative">
                <Image
                    src="/imgs/gp_logo_gradient_transBG.png"
                    alt="Galatic_Polymath_Tier_Info_Modal"
                    fill
                    className="me-3 me-sm-0 modalImg position-absolute"
                    style={{
                        maxWidth: "100%",
                        objectFit: 'contain'
                    }} />
                <Title className="fw625 text-center text-sm-start border border-white modalTitleSec">
                    <h3 className="ms-2 ms-sm-0">{title}</h3>
                </Title>
                <button onClick={handleCloseModal} className="position-absolute top-0 end-0 noBtnStyles"><IoIosCloseCircle className="closeButtonTxtColor" /></button>
            </Header>
            <Body className="hireUsModalStyles">
                <section className="d-flex flex-column">
                    <section className="d-flex flex-column">
                        {isOnGPLearningExpModal ?
                            <>
                                <span className="fw300 text-center text-sm-start">{texts[0].normalTxt}</span>
                                <section className="d-flex flex-column ps-4 mt-3">
                                    {texts.slice(1, 5).map((text, index) => {
                                        const { normalTxt, boldTxt } = text;
                                        return (
                                            <span className={`${index !== 0 ? 'mt-3' : ''} modalTxt fw300`} key={index}>
                                                {boldTxt ? <span className="fw-bolder fw625 tierInfoBoldTxt">{boldTxt}</span> : null}
                                                {normalTxt}
                                            </span>
                                        )
                                    })}
                                </section>
                            </>
                            :
                            texts.map((text, index) => {
                                const { normalTxt, boldTxt } = text;
                                return (
                                    <span className={`${index !== 0 ? 'mt-3' : ''} tierModalTxt fw300 text-center text-sm-start`} key={index}>
                                        {boldTxt ? <span className="fw-bolder">{boldTxt}</span> : null}
                                        {normalTxt}
                                    </span>
                                )
                            })
                        }
                    </section>
                    {videoLink &&
                        <section className="mt-3">
                            <div className="tierInfoVideo d-flex justify-content-center align-items-center rounded overflow-hidden">
                                <ReactPlayer
                                    url={videoLink}
                                    width='100%'
                                    height="100%"
                                    light={true}
                                    playing
                                    controls />
                            </div>
                        </section>
                    }
                </section>
            </Body>
            <Footer>
                <Button variant="secondary" onClick={handleCloseModal} className="closeButtonBackgroundColor fw300">Close</Button>
            </Footer>
        </Modal>
    );



}

export default TierInfoModal;
