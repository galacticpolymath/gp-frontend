/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext } from "react";
import Button from "../../General/Button";
import { UserContext } from "../../../providers/UserProvider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CustomError } from "../../../backend/utils/errors";
import { convertMapToObj } from "../../../globalFns";
import { ModalContext } from "../../../providers/ModalProvider";

/** 
 * @function
 * @template TData
 * @param {Map<string, TData>} map
 * @return {Map<string, TData>}
 */
const filterOutFalseyValMapProperties = map => {
    const falseyValsFiltered = Array.from(map.entries()).filter(([, val]) => val);

    return new Map(falseyValsFiltered);
};

const SubmitAboutUserFormBtn = ({ setErrors }) => {
    const { _aboutUserForm } = useContext(UserContext);
    const { _notifyModal, _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const session = useSession();
    /** @type { [import("../../../providers/UserProvider").TAboutUserForm] } */
    const [aboutUserForm] = _aboutUserForm;
    const [, setIsAboutUserModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const { user, token } = session.data;

    const handleSubmitBtnClick = async (event) => {
        try {
            event.preventDefault();

            if (!user.email) {
                throw new CustomError("Email is not present.", null, "emailNotPresent");
            }

            let aboutUserFormClone = structuredClone(aboutUserForm);
            let {
                country,
                zipCode,
                reasonsForSiteVisit,
                subjects,
                occupation,
                gradesOrYears,
            } = aboutUserFormClone;
            let errors = new Map();

            if(!gradesOrYears?.ageGroupsTaught?.length){
                delete aboutUserFormClone.gradesOrYears;
            }

            if (subjects.size > 0) {
                subjects = filterOutFalseyValMapProperties(subjects);
            }

            if (subjects.size > 0) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    subjects: convertMapToObj(subjects),
                };
            }

            if (reasonsForSiteVisit.size > 0) {
                reasonsForSiteVisit = filterOutFalseyValMapProperties(reasonsForSiteVisit);
            }

            if (reasonsForSiteVisit.size > 0) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    reasonsForSiteVisit: convertMapToObj(reasonsForSiteVisit),
                };
            }

            if ((country.toLowerCase() === 'united states') && (!zipCode || (zipCode.toString().length == 0) || (zipCode < 0))) {
                errors.set('zipCode', 'This field is required');
            }

            if(occupation.length <= 0){
                errors.set('occupation', 'This field is required.');
            }

            if (country.length <= 0) {
                errors.set('country', 'This field is required.');
            }

            if (errors.size > 0) {
                setErrors(errors);

                throw new CustomError("Invalid entries. Please try again.", null, "invalidAboutUserForm.");
            }

            const responseBody = {
                aboutUserForm: aboutUserFormClone,
                userEmail: user.email,
            };

            const response = await axios.put(
                `${window.location.origin}/api/save-about-user-form`,
                responseBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            console.log('response: ', response);

            if (response.status !== 200) {
                throw new CustomError('Failed to save form. Refresh the page, and try again.', null, "aboutUserFormReqFailure");
            }

            setIsAboutUserModalDisplayed(false);

            setTimeout(() => {
                setNotifyModal({
                    isDisplayed: true,
                    bodyTxt: '',
                    headerTxt: 'Form Saved! Thank you!',
                    handleOnHide: () => {
                        session.update();
                    },
                });
            }, 300);

            console.log("From server, response.data: ", response.data);
        } catch (error) {
            const { message } = error ?? {};

            console.error("An error has occurred. Couldn't update the 'About User' form. Reason: ", error);

            alert(message ?? "Failed to save your changes. Please refresh the page and try again.");
        }
    };
    return (
        <Button
            handleOnClick={handleSubmitBtnClick}
            classNameStr='mt-2 no-btn-styles text-white bg-primary p-2 rounded'
        >
            <span>SUBMIT & SAVE</span>
        </Button>
    );
};

export default SubmitAboutUserFormBtn;