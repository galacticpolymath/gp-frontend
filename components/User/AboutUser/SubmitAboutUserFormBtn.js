/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from "react";
import Button from "../../General/Button";
import { UserContext } from "../../../providers/UserProvider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CustomError } from "../../../backend/utils/errors";
import { convertMapToObj, sleep } from "../../../globalFns";
import { ModalContext } from "../../../providers/ModalProvider";
import { Spinner } from "react-bootstrap";

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

const SubmitAboutUserFormBtn = ({ setErrors, countryNames }) => {
    const { _aboutUserForm } = useContext(UserContext);
    const { _notifyModal, _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const session = useSession();
    /** @type { [import("../../../providers/UserProvider").TAboutUserForm] } */
    const [aboutUserForm] = _aboutUserForm;
    const [wasBtnClicked, setWasBtnClicked] = useState(false);
    const [, setIsAboutUserModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const { user, token } = session.data;

    const handleSubmitBtnClick = async event => {
        setWasBtnClicked(true);

        await sleep(200);

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
            const errors = new Map();

            if (!gradesOrYears?.ageGroupsTaught?.length) {
                delete aboutUserFormClone.gradesOrYears;
            }

            if (subjects?.size > 0) {
                subjects = filterOutFalseyValMapProperties(subjects);
            }

            if (subjects?.size > 0) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    subjects: convertMapToObj(subjects),
                };
            }

            if (reasonsForSiteVisit?.size > 0) {
                reasonsForSiteVisit = filterOutFalseyValMapProperties(reasonsForSiteVisit);
            }

            if (reasonsForSiteVisit?.size > 0) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    reasonsForSiteVisit: convertMapToObj(reasonsForSiteVisit),
                };
            }

            if ((country?.toLowerCase() === 'united states') && (!zipCode || (zipCode?.toString()?.length == 0) || (zipCode < 0))) {
                errors.set('zipCode', 'This field is required');
            }

            if (!occupation || (occupation?.length <= 0)) {
                errors.set('occupation', 'This field is required.');
            }

            if (country?.length <= 0) {
                errors.set('country', 'This field is required.');
            } else if (!countryNames?.includes(country)) {
                errors.set('country', 'Invalid country name.');
            }

            if (errors?.size > 0) {
                setErrors(errors);

                const errMsg = (errors.size === 1) ? "Invalid entry. Please try again" : "Invalid entries. Please try again";

                throw new CustomError(errMsg, null, "invalidAboutUserForm.");
            }

            const responseBody = {
                aboutUserForm: aboutUserFormClone,
                userEmail: user.email,
            };
            debugger;

            const response = await axios.put(
                `${window.location.origin}/api/save-about-user-form`,
                responseBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

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
            console.log('error: ', error);
            const { message, response } = error ?? {};

            console.error("An error has occurred. Couldn't update the 'About User' form. Reason: ", error);

            alert(message ? `${response ? 'From server:' : ''} ${message}. ${response?.data ?? ''}` : "Failed to save your changes. Please refresh the page and try again.");
        } finally {
            setWasBtnClicked(false);
        }
    };
    return (
        <Button
            handleOnClick={handleSubmitBtnClick}
            classNameStr='mt-2 no-btn-styles text-white p-2 rounded'
            defaultStyleObj={{ width: '150px' }}
            backgroundColor={wasBtnClicked ? 'grey' : '#4C96CC'}
        >
            {wasBtnClicked ? <Spinner size="sm" className='text-white' /> : <span>SUBMIT & SAVE</span>}
        </Button>
    );
};

export default SubmitAboutUserFormBtn;