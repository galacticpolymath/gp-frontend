/* eslint-disable no-debugger */
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
import { convertMapToObj, getIsParsableToVal, sleep } from "../../../globalFns";
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

export const sendAboutUserFormToServer = async (
    aboutUserForm,
    setWasBtnClicked,
    setErrors,
    setIsAboutUserModalDisplayed,
    setNotifyModal,
    email,
    countryNames,
    token,
) => {
    setWasBtnClicked(true);

    await sleep(200);

    try {
        let aboutUserFormClone = structuredClone(aboutUserForm);
        let {
            country,
            zipCode,
            reasonsForSiteVisit,
            subjects,
            occupation,
            gradesOrYears,
            classroomSize,
            isTeacher,
            isTeacherConfirmed
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
            aboutUserFormClone.classroomSize = {
                isNotTeaching: false,
                num: 0,
            };
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

        const zipCodeStr = ((typeof zipCode === 'string') && Number.isInteger(+zipCode)) ? zipCode.trim() : "";

        console.log("yo there meng, isTeacherConfirmed: ", isTeacherConfirmed);

        if (!isTeacherConfirmed) {
            errors.set('isTeacherConfirmationErr', 'This field is required');
        }

        if ((country?.toLowerCase() === 'united states') && (!zipCodeStr || (zipCodeStr?.length == 0))) {
            errors.set('zipCode', 'This field is required');
        } else if ((country.toLowerCase() === 'united states') && (zipCode < 0)) {
            errors.set('zipCode', 'Cannot be a negative number.');
        } else if ((country.toLowerCase() === 'united states') && (((zipCodeStr?.length > 0) && (zipCodeStr?.length < 5)) || (zipCodeStr.length > 5))) {
            errors.set('zipCode', 'Invalid zip code. Must be 5 digits.');
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

        if ((isTeacher && !classroomSize.isNotTeaching) && ((Number.isInteger(+classroomSize.num) && (Number.parseInt(classroomSize.num) <= 0)) || !classroomSize)) {
            errors.set('classroomSize', `*This field is required. Must be greater than 0.`);
        }

        if (isTeacher && (subjects.size === 0)) {
            errors.set('subjects', `*This field is required.`);
        }

        if (errors?.size > 0) {
            setErrors(errors);

            const errMsg = (errors.size === 1) ? "Invalid entry. Please try again" : "Invalid entries. Please try again";

            throw new CustomError(errMsg, null, "invalidAboutUserForm.");
        }

        if (country?.toLowerCase() === 'united states') {
            aboutUserFormClone = {
                ...aboutUserFormClone,
                zipCode: Number.parseInt(zipCode),
            };
        }

        const responseBody = {
            aboutUserForm: aboutUserFormClone,
            userEmail: email,
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
        setErrors(new Map());
        setTimeout(() => {
            setNotifyModal({
                isDisplayed: true,
                bodyTxt: '',
                headerTxt: 'Form Saved! Thank you!',
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

const SubmitAboutUserFormBtn = ({ setErrors, countryNames, _wasBtnClicked }) => {
    const { _aboutUserForm } = useContext(UserContext);
    const { _notifyModal, _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const { data, update } = useSession();
    /** @type { [import("../../../providers/UserProvider").TAboutUserForm] } */
    const [aboutUserForm] = _aboutUserForm;
    const [wasBtnClicked, setWasBtnClicked] = _wasBtnClicked;
    const [, setIsAboutUserModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const { user, token } = data ?? {};

    const handleSubmitBtnClick = async event => {
        event.preventDefault();

        setWasBtnClicked(true);

        await sleep(200);

        try {
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
                classroomSize,
                isTeacher,
                isTeacherConfirmed
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
                aboutUserFormClone.classroomSize = {
                    isNotTeaching: false,
                    num: 0,
                };
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

            const zipCodeStr = ((typeof zipCode === 'string') && Number.isInteger(+zipCode)) ? zipCode.trim() : "";

            console.log("yo there meng, isTeacherConfirmed: ", isTeacherConfirmed);

            if (!isTeacherConfirmed) {
                errors.set('isTeacherConfirmationErr', '*This field is required');
            }

            if ((country?.toLowerCase() === 'united states') && (!zipCodeStr || (zipCodeStr?.length == 0))) {
                errors.set('zipCode', 'This field is required');
            } else if ((country.toLowerCase() === 'united states') && (zipCode < 0)) {
                errors.set('zipCode', 'Cannot be a negative number.');
            } else if ((country.toLowerCase() === 'united states') && (((zipCodeStr?.length > 0) && (zipCodeStr?.length < 5)) || (zipCodeStr.length > 5))) {
                errors.set('zipCode', 'Invalid zip code. Must be 5 digits.');
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

            if ((isTeacher && !classroomSize.isNotTeaching) && ((Number.isInteger(+classroomSize.num) && (Number.parseInt(classroomSize.num) <= 0)) || !classroomSize)) {
                errors.set('classroomSize', `*This field is required. Must be greater than 0.`);
            }

            if (isTeacher && (subjects.size === 0)) {
                errors.set('subjects', `*This field is required.`);
            }

            if (errors?.size > 0) {
                setErrors(errors);

                const errMsg = (errors.size === 1) ? "Invalid entry. Please try again" : "Invalid entries. Please try again";

                throw new CustomError(errMsg, null, "invalidAboutUserForm.");
            }

            if (country?.toLowerCase() === 'united states') {
                aboutUserFormClone = {
                    ...aboutUserFormClone,
                    zipCode: Number.parseInt(zipCode),
                };
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

            if (response.status !== 200) {
                throw new CustomError('Failed to save form. Refresh the page, and try again.', null, "aboutUserFormReqFailure");
            }
            const userAccountParsable = localStorage.getItem('userAccount');
            const userAccount = getIsParsableToVal(userAccountParsable, "object") ? JSON.parse(userAccountParsable) : {};
            aboutUserFormClone = {
                ...userAccount,
                ...aboutUserFormClone,
            };
            localStorage.setItem('userAccount', JSON.stringify(aboutUserFormClone));
            setIsAboutUserModalDisplayed(false);
            setErrors(new Map());
            setTimeout(() => {
                setNotifyModal({
                    isDisplayed: true,
                    bodyTxt: '',
                    headerTxt: 'Form Saved! Thank you!',
                });
                update();
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
            classNameStr='mt-2 no-btn-styles text-white p-2 rounded '
            defaultStyleObj={{ width: '150px' }}
            backgroundColor={wasBtnClicked ? 'grey' : '#4C96CC'}
        >
            {wasBtnClicked ? <Spinner size="sm" className='text-white' /> : <span>SUBMIT & SAVE</span>}
        </Button>
    );
};

export default SubmitAboutUserFormBtn;