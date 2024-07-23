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

const SubmitAboutUserFormBtn = ({ setErrors }) => {
    const { _aboutUserForm } = useContext(UserContext);
    const session = useSession();
    const [, aboutUserForm] = _aboutUserForm;
    console.log('current session: ', session);
    const { user, token } = session.data;

    const handleSubmitBtnClick = async (event) => {
        try {
            event.preventDefault();

            if (!user.email) {
                throw new CustomError("Email is not present.", null, "emailNotPresent");
            }

            const {
                country,
                zipCode,
                classroomSize,
            } = aboutUserForm;
            let errors = {};

            if ((country.toLowerCase() === 'united states')(!zipCode || (zipCode.toString().length == 0) || (zipCode < 0))) {
                errors.push({ field: 'zipCode', msg: 'Invalid zip code.' });
                errors = { zipCode: 'Invalid zip code.' };
            }

            if (country.length < 0) {
                errors = { ...errors, country: 'The "Country" field is required.' };
            }

            if (classroomSize <= 0) {
                errors = { ...errors, classroomSize: 'Must be greater than 0.' };
            }

            if (Object.keys(errors).length) {
                setErrors(errors);

                throw new CustomError("Invalid entries for the 'About User' form.", null, "invalidAboutUserForm.");
            }

            const responseBody = {
                aboutUser: aboutUserForm,
                email: user.email,
            };
            const response = await axios.post(
                `${window.location.origin}/api/save-about-user-form`,
                responseBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (response.status !== 200) {
                throw new CustomError('Failed to save the "AboutUser" form.', null, "aboutUserFormReqFailure");
            }

            if(response.msg !== 'success' || !response.msg){
                throw new CustomError("Did not receive confirmation if the 'AboutUser' form was saved.", "abooutUserFormResponseConfirmationFailure");
            }
        } catch (error) {
            console.error("An error has occurred. Couldn't update the 'About User' form. Reason: ", error);
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