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
        event.preventDefault();

        setWasBtnClicked(true);

        await sleep(200);

        try {

            if (!user.email) {
                throw new CustomError("Email is not present.", null, "emailNotPresent");
            }

            let aboutUserFormClone = structuredClone(aboutUserForm);
            console.log('aboutUserFormClone: ', aboutUserFormClone);
            let {
                country,
                zipCode,
                reasonsForSiteVisit,
                subjects,
                occupation,
                gradesOrYears,
                classroomSize,
                isTeacher,
            } = aboutUserFormClone;
            const { ageGroupsTaught, selection } = gradesOrYears ?? {};
            const errors = new Map();

            if (!ageGroupsTaught?.length || !isTeacher) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    gradesOrYears: {
                        selection: '',
                        ageGroupsTaught: [],
                    },
                };
            }

            if (!isTeacher) {
                aboutUserFormClone.classroomSize = 0;
            }

            if (isTeacher && (subjects?.size > 0)) {
                subjects = filterOutFalseyValMapProperties(subjects);
            }

            if (isTeacher && (subjects?.size > 0)) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    subjects: convertMapToObj(subjects),
                };
            } else if (!isTeacher) {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    subjects: {},
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

            // adding the errors
            if ((country?.toLowerCase() === 'united states') && (!zipCode || (zipCode?.toString()?.length == 0) || (zipCode < 0))) {
                errors.set('zipCode', 'This field is required');
            }

            if (!occupation || (occupation?.length <= 0)) {
                errors.set('occupation', '*This field is required.');
            }

            if (country?.length <= 0) {
                errors.set('country', '*This field is required.');
            } else if (!countryNames?.includes(country)) {
                errors.set('country', '*Invalid country name.');
            }

            if (isTeacher && !selection) {
                errors.set('gradesOrYears', `*Please select either "U.S." or "outside U.S."`);
            } else if (isTeacher && !ageGroupsTaught?.length) {
                errors.set('gradesOrYears', `*Please select atleast one grade or year.`);
            }

            if (isTeacher && ((Number.isInteger(+classroomSize) && (Number.parseInt(classroomSize) <= 0)) || !classroomSize)) {
                errors.set('classroomSize', `*This field is required. Must be greater than 0.`);
            }

            if (isTeacher && subjects.size === 0) {
                errors.set('subjects', `*This field is required.`);
            }

            if (errors?.size > 0) {
                setErrors(errors);

                const errMsg = (errors.size === 1) ? "Invalid entry. Please try again" : "Invalid entries. Please try again";

                throw new CustomError(errMsg, null, "invalidAboutUserForm.");
            }

            console.log('aboutUserFormClone, after updates: ', aboutUserFormClone);

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

            if (response.status !== 200) {
                throw new CustomError('Failed to save form. Refresh the page, and try again.', null, "aboutUserFormReqFailure");
            }

            localStorage.setItem('userAccount', JSON.stringify(aboutUserFormClone));

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
        } catch (error) {
            console.error('error: ', error);
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