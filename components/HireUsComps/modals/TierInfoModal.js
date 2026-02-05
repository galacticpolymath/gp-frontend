 
 
 
 
 
 
 
 
 
 
 
 
 
 
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
            <Header className="tierInfoModalHeader pe-4 border-bottom d-flex pt-4 position-relative">
                <div style={{ right: "10px", bottom: "5px" }} className="position-absolute">
                    <div className="modalImgContainer position-relative">
                        <Image
                            src="/imgs/gp_logo_gradient_transBG.png"
                            alt="Galatic_Polymath_Tier_Info_Modal"
                            fill
                            className="me-3 me-sm-0 position-absolute"
                            style={{
                                maxWidth: "100%",
                                objectFit: 'contain'
                            }} />
                    </div>
                </div>
                <Title className="fw625 text-start border border-white modalTitleSec">
                    <h3 className="ms-2 ms-sm-3 ps-lg-2">{title}</h3>
                </Title>
                <button onClick={handleCloseModal} className="position-absolute top-0 end-0 noBtnStyles"><IoIosCloseCircle className="closeButtonTxtColor" /></button>
            </Header>
            <Body className="hireUsModalStyles">
                <section className="d-flex flex-column">
                    <section className="d-flex flex-column">
                        {isOnGPLearningExpModal ?
                            <>
                                <span className="fw300 text-start">{texts[0].normalTxt}</span>
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
                                    <span className={`${index !== 0 ? 'mt-3' : ''} tierModalTxt fw300 text-start`} key={index}>
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
            <Footer className="tierInfoModalFooter">
                <Button variant="secondary" onClick={handleCloseModal} className="closeButtonBackgroundColor fw300">Close</Button>
            </Footer>
        </Modal>
    );



}

export default TierInfoModal;
