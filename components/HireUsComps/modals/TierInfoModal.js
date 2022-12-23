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
import Image from 'next/image'

const { Header, Title, Body } = Modal;

// map the array that contains all of the modals onto the ui. Each object should contain the following field: isModalOn: false
// when the user clicks on a specific tier info get the specific index of the tier info that was clicked 
// using that index find the specific modal in the Modal array and change isModalOn to true

const TierInfoModal = ({ tierModalInfo, setTiersInfoForModal, index }) => {
    const { isOnModal, title } = tierModalInfo;

    const handleCloseModal = () => {

    }

    return (
        <Modal show={isOnModal} onHide={handleCloseModal}>
            <Header closeButton className="">
                <Title>{title}</Title>
                <Image src="/imgs/gp_logo_gradient_transBG.png" alt="Galatic_Polymath_Tier_Info_Modal" /> 
            </Header>
            <Body>
                Woohoo, you're reading this text in a modal!
            </Body>
        </Modal>
    )



}

export default TierInfoModal;
