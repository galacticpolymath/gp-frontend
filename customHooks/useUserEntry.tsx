/* eslint-disable no-useless-escape */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import axios from "axios";
import { signIn } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { constructUrlWithSearchQuery, validateEmail } from "../globalFns";
import { useCustomCookies } from "./useCustomCookies";

type TLoginForm = {
  email: string;
  password: string;
};
interface TCreateAccount {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isOnMailingList: boolean;
}
interface IDoesUserExistResBody {
  doesUserExist?: boolean;
  msg?: string;
}
type TUserLoginErrType =
  | "none"
  | "userNotFound"
  | "invalidCredentials"
  | "googleLogin";
interface ICanLoginResBody {
  canLogin: boolean;
  errType: TUserLoginErrType;
}
type TForm = { login: TLoginForm; createAccount: TCreateAccount } & {
  callbackUrl: string;
};

export const getUserLoginErrType = async (
  email: string,
  password: string
): Promise<TUserLoginErrType> => {
  try {
    const url = `${window.location.origin}/api/can-login`;
    const response = await axios.post<ICanLoginResBody>(
      url,
      {
        email,
        password,
      },
      {
        timeout: 4_000,
      }
    );

    return response.data.errType;
  } catch (error: any) {
    console.error("Cannot log user in. Reason: ", error);

    const { errType, msg } = error?.response?.data ?? {};

    console.error("Message from server: ", msg);

    return errType ?? "invalidCredentials";
  }
};

const getDoesEmailExist = async (email: string) => {
  try {
    const url = constructUrlWithSearchQuery(
      `${window.location.origin}/api/does-user-exist`,
      [["email", email]]
    );
    const response = await axios.get<IDoesUserExistResBody>(url.href);
    const { status, data } = response;

    console.log("data: ", data);

    if (status !== 200) {
      throw new Error("Received a non 200 response from the server.");
    }

    if (typeof data !== "object" || typeof data?.doesUserExist !== "boolean") {
      throw new Error("Receivded a invalid response body from the server.");
    }

    return !!data.doesUserExist;
  } catch (error) {
    console.error("Failed to check if the email exist. Reason: ", error);

    return false;
  }
};

export const useUserEntry = () => {
  const [userErrorType, setUserErrorType] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [userEntryErrors, setUserEntryErrors] = useState(new Map());
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const [isUserEntryInProcess, setIsUserEntryInProcess] = useState(false);
  const { removeAppCookies } = useCustomCookies();
  const [createAccountForm, setCreateAccountForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isOnMailingList: true,
  });

  /**
   * Validates the form for the user entry (create account or login).
   * @param {"credentials" | "google"} provider The provider used for the user entry. Can be "credentials" or "google".
   * @returns {Map<string, string>} A map of errors where the key is the field name and the value is the error message. If the form is valid, an empty map is returned.
   */
  const validateForm = async (provider: "credentials" | "google") => {
    console.log("createAccountForm: ", createAccountForm);
    const { password, confirmPassword, email, firstName, lastName } =
      createAccountForm;
    const errors = new Map();
    const isCredentialsAccountCreation = provider === "credentials";

    if (isCredentialsAccountCreation && password !== confirmPassword) {
      errors.set("password", "The passwords don't match.");
      errors.set("confirmPassword", "The passwords don't match.");
    } else if (isCredentialsAccountCreation && !password && !confirmPassword) {
      errors.set("password", "This field is required.");
      errors.set("confirmPassword", "This field is required.");
    }

    if (isCredentialsAccountCreation && !firstName) {
      errors.set("firstName", "This field is required.");
    }

    if (isCredentialsAccountCreation && !lastName) {
      errors.set("lastName", "This field is required.");
    }

    const doesEmailExist = await getDoesEmailExist(email);

    if (isCredentialsAccountCreation && doesEmailExist) {
      errors.set("email", "This email has been taken.");
    } else if (isCredentialsAccountCreation && !validateEmail(email)) {
      errors.set("email", "Invalid email.");
    }

    return errors;
  };
  
  /**
   * Sends the form to the server based on the form type and provider type.
   * @param {string} formType The type of the form. Can be "login" or "createAccount".
   * @param {string} providerType The type of the provider. Can be "credentials" or "google".
   * @param {{ login: TLoginForm; createAccount: TCreateAccount } & { callbackUrl: string }} form The form to send to the server.
   * @throws {Error} If the form is empty or if there is no form type.
   */
  const sendFormToServer = (
    formType: "login" | "createAccount",
    providerType: "credentials" | "google",
    form: Partial<{ login: TLoginForm; createAccount: TCreateAccount } & { callbackUrl: string }>
  ) => {
    try {
      if (
        (form.createAccount && !Object.keys(form.createAccount).length) ||
        (form.login && !Object.keys(form.login).length) ||
        !formType
      ) {
        setUserErrorType("emptyInputs");

        throw new Error("Received empty inputs.");
      }

      if (!form.createAccount && !form.login) {
        throw new Error('No form was passed for the "form" argument.');
      }

      if (form.createAccount && form.login) {
        throw new Error(
          'Cannot have both a "createAccount" form and a "login" form.'
        );
      }

      let formToSend: Record<string, unknown> = {
        ...(form.createAccount ?? form.login),
        formType: formType,
        clientOrigin: window.location.origin,
        callbackUrl: form.callbackUrl,
      };

      if (form?.createAccount?.isOnMailingList) {
        formToSend = {
          ...formToSend,
          clientUrl: `${window.location.origin}/mailing-list-confirmation`,
        };
      }

      signIn(providerType, formToSend);
    } catch (error) {
      console.error(
        "An error has occurred. Failed to send form to the server. Reason: ",
        error
      );
      alert(
        "An error has occurred during the login process. Please refresh the page. If this error persists, please contact support."
      );
    }
  };

  const handleOnInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateAccountForm((form) => ({
      ...form,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLoginBtnClick = async () => {
    setIsUserEntryInProcess(true);
    setUserEntryErrors(new Map());

    const errors = new Map();
    const { email, password } = loginForm;

    if (!email) {
      errors.set("email", "This field is required.");
    } else if (!validateEmail(email)) {
      errors.set("email", "Invalid email.");
    }

    if (!password) {
      errors.set("password", "This field is required.");
    }

    if (errors.size > 0) {
      setTimeout(() => {
        setIsUserEntryInProcess(false);
        setUserEntryErrors(errors);
      }, 200);
      return;
    }

    const userLoginErrType = await getUserLoginErrType(email, password);

    if (userLoginErrType === "googleLogin") {
      errors.set("email", "This email exists but uses Google to log in.");
    } else if (userLoginErrType === "userNotFound") {
      errors.set("email", "Email not found.");
    } else if (userLoginErrType === "invalidCredentials") {
      errors.set("email", "Email or password is incorrect.");
      errors.set("password", "Email or password is incorrect.");
    }

    if (errors.size > 0) {
      setTimeout(() => {
        setIsUserEntryInProcess(false);
        setUserEntryErrors(errors);
      }, 200);
      return;
    }

    removeAppCookies([
      "gdriveAccessToken",
      "gdriveAccessTokenExp",
      "gdriveRefreshToken",
    ]);
    sendFormToServer("login", "credentials", {
      login: {
        email,
        password,
      },
    });
  };

  return {
    sendFormToServer,
    userErrorType,
    validateForm,
    handleOnInputChange,
    handleLoginBtnClick,
    _userEntryErrors: [userEntryErrors, setUserEntryErrors],
    _isUserEntryInProcess: [isUserEntryInProcess, setIsUserEntryInProcess],
    _loginForm: [loginForm, setLoginForm],
    _createAccountForm: [createAccountForm, setCreateAccountForm],
    _isUserTeacher: [isUserTeacher, setIsUserTeacher],
  } as const;
};
