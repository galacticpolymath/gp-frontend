import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IUserSession } from "../types/global";
import axios from "axios";
import {
  TAboutUserFormForUI,
  TUserAccount,
  userAccountDefault,
  useUserContext,
} from "../providers/UserProvider";
import { TAboutUserForm, TUserSchemaForClient } from "../backend/models/User/types";

export const getAboutUserFormForClient = (userAccount: TUserSchemaForClient) => {
  let userAccountForClient = { ...userAccountDefault };
  const {
    reasonsForSiteVisit,
    subjects,
    gradesOrYears,
    classroomSize,
    zipCode,
    country,
    occupation,
    gpPlusSubscription,
    isGpPlusMember,
    isTeacher,
    name,
    firstName,
    lastName,
    referredByDefault,
    referredByOther,
    schoolTypeDefaultSelection,
    schoolTypeOther,
    classSize,
    subjectsTaughtDefault,
    institution,
    subjectsTaughtCustom,
    siteVisitReasonsCustom,
    siteVisitReasonsDefault,
    isNotTeaching,
    gradesTaught,
    gradesType,
  } = userAccount;

  if (reasonsForSiteVisit && Object.entries(reasonsForSiteVisit).length > 0) {
    const reasonsForSiteVisitMap = new Map(
      Object.entries(reasonsForSiteVisit)
    ) as Map<string, string>;
    userAccountForClient = {
      ...userAccountForClient,
      reasonsForSiteVisit: reasonsForSiteVisitMap,
    };
  }

  if (referredByOther) {
    userAccountForClient = {
      ...userAccountForClient,
      referredByOther,
    };
  }

  if (typeof isGpPlusMember === "boolean") {
    userAccountForClient = {
      ...userAccountForClient,
      isGpPlusMember,
    };
  }

  if (schoolTypeDefaultSelection) {
    userAccountForClient = {
      ...userAccountForClient,
      schoolTypeDefaultSelection,
    };
  }

  if (schoolTypeOther) {
    userAccountForClient = {
      ...userAccountForClient,
      schoolTypeOther,
    };
  }

  userAccountForClient = {
    ...userAccountForClient,
    isNotTeaching: !!isNotTeaching,
  };

  if (typeof classSize === "number") {
    userAccountForClient = {
      ...userAccountForClient,
      classSize,
    };
  }

  if (
    typeof classSize === "number" &&
    typeof isNotTeaching === "undefined" &&
    typeof classroomSize === "object" &&
    classroomSize
  ) {
    userAccountForClient.classroomSize = classroomSize;
  }

  if (subjectsTaughtDefault) {
    userAccountForClient = {
      ...userAccountForClient,
      subjectsTaughtDefault,
    };
  }

  console.log("institution, sup there: ", institution);

  if (institution || institution == null) {
    userAccountForClient = {
      ...userAccountForClient,
      institution,
    };
  }

  if (subjectsTaughtCustom) {
    userAccountForClient = {
      ...userAccountForClient,
      subjectsTaughtCustom,
    };
  }

  if (siteVisitReasonsCustom) {
    userAccountForClient = {
      ...userAccountForClient,
      siteVisitReasonsCustom,
    };
  }

  if (siteVisitReasonsDefault) {
    userAccountForClient = {
      ...userAccountForClient,
      siteVisitReasonsDefault,
    };
  }

  if (gradesTaught) {
    userAccountForClient = {
      ...userAccountForClient,
      gradesTaught,
    };
  }

  if (gradesType) {
    userAccountForClient = {
      ...userAccountForClient,
      gradesType,
    };
  }

  if (referredByDefault) {
    userAccountForClient = {
      ...userAccountForClient,
      referredByDefault,
    };
  }

  if (subjects && Object.entries(subjects).length > 0) {
    const subjectsTeaching = new Map(Object.entries(subjects));
    userAccountForClient = {
      ...userAccountForClient,
      subjects: subjectsTeaching as Map<string, string>,
    };
  } else if (subjects && Object.entries(subjects).length == 0) {
    userAccountForClient.subjects = userAccountDefault.subjects;
  }

  if (
    gradesOrYears &&
    Object.entries(gradesOrYears).length > 0 &&
    gradesOrYears.selection
  ) {
    userAccountForClient.gradesOrYears = gradesOrYears;
  } else if (
    gradesOrYears &&
    (Object.entries(gradesOrYears).length === 0 ||
      !gradesOrYears.selection ||
      !gradesOrYears?.ageGroupsTaught?.length)
  ) {
    userAccountForClient.gradesOrYears = {
      selection: "U.S.",
      ageGroupsTaught: [],
    };
  }

  if (
    userAccount &&
    (Object.entries(userAccount).length === 0 ||
      !gradesOrYears?.selection ||
      !gradesOrYears?.ageGroupsTaught?.length)
  ) {
    userAccount.gradesOrYears = {
      selection: "U.S.",
      ageGroupsTaught: [],
    };
  }

  if (zipCode) {
    userAccountForClient.zipCode = zipCode;
  }

  if (country) {
    userAccountForClient.country = country;
  }

  if (occupation) {
    userAccountForClient.occupation = occupation;
  }

  if (firstName || lastName) {
    userAccountForClient = {
      ...userAccountForClient,
      firstName: firstName ?? name?.first,
      lastName: lastName ?? name?.first,
    };
  }

  console.log("userAccountForClient: ", userAccountForClient);

  userAccountForClient.isTeacher = isTeacher ?? false;

  return { userAccountForClient, gpPlusSubscription };
};

export const useGetAboutUserForm = (willGetData: boolean = true) => {
  const { status, data } = useSession();
  const { _aboutUserForm } = useUserContext();
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
  const [gpPlusSub, setGpPlusSub] = useState<TUserSchemaForClient["gpPlusSubscription"] | null>(null);
  const { user, token } = (data ?? {}) as IUserSession;
  const [isRetrievingUserData, setIsRetrievingUserData] = useState(true);

  useEffect(() => {
    if (!willGetData && Object.keys(aboutUserForm).length) {
      return;
    }

    if (status === "authenticated") {
      (async () => {
        try {
          const paramsAndHeaders = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get<TUserSchemaForClient>(
            "/api/get-user-account-data",
            paramsAndHeaders
          );

          console.log("userAccount data: ", response.data);

          if (response.status !== 200) {
            throw new Error(
              "Failed to get 'AboutUser' form for the target user."
            );
          }

          const userAccount = response.data;
          let userAccountForClient = { ...userAccountDefault };
          const {
            reasonsForSiteVisit,
            subjects,
            gradesOrYears,
            classroomSize,
            zipCode,
            country,
            occupation,
            gpPlusSubscription,
            isGpPlusMember,
            isTeacher,
            name,
            firstName,
            lastName,
            referredByDefault,
            referredByOther,
            schoolTypeDefaultSelection,
            schoolTypeOther,
            classSize,
            subjectsTaughtDefault,
            institution,
            subjectsTaughtCustom,
            siteVisitReasonsCustom,
            siteVisitReasonsDefault,
            isNotTeaching,
            gradesTaught,
            gradesType,
          } = userAccount;

          if(gpPlusSubscription) {
            setGpPlusSub(gpPlusSubscription);
          }

          if (
            reasonsForSiteVisit &&
            Object.entries(reasonsForSiteVisit).length > 0
          ) {
            const reasonsForSiteVisitMap = new Map(
              Object.entries(reasonsForSiteVisit)
            ) as Map<string, string>;
            userAccountForClient = {
              ...userAccountForClient,
              reasonsForSiteVisit: reasonsForSiteVisitMap,
            };
          }

          if (referredByOther) {
            userAccountForClient = {
              ...userAccountForClient,
              referredByOther,
            };
          }

          if (typeof isGpPlusMember === "boolean") {
            userAccountForClient = {
              ...userAccountForClient,
              isGpPlusMember,
            };
          }

          if (schoolTypeDefaultSelection) {
            userAccountForClient = {
              ...userAccountForClient,
              schoolTypeDefaultSelection,
            };
          }

          if (schoolTypeOther) {
            userAccountForClient = {
              ...userAccountForClient,
              schoolTypeOther,
            };
          }

          userAccountForClient = {
            ...userAccountForClient,
            isNotTeaching: !!isNotTeaching,
          };

          if (typeof classSize === "number") {
            userAccountForClient = {
              ...userAccountForClient,
              classSize,
            };
          }

          if (
            typeof classSize === "number" &&
            typeof isNotTeaching === "undefined" &&
            typeof classroomSize === "object" &&
            classroomSize
          ) {
            userAccountForClient.classroomSize = classroomSize;
          }

          if (subjectsTaughtDefault) {
            userAccountForClient = {
              ...userAccountForClient,
              subjectsTaughtDefault,
            };
          }

          console.log("institution, sup there: ", institution);

          if (institution || institution == null) {
            userAccountForClient = {
              ...userAccountForClient,
              institution,
            };
          }

          if (subjectsTaughtCustom) {
            userAccountForClient = {
              ...userAccountForClient,
              subjectsTaughtCustom,
            };
          }

          if (siteVisitReasonsCustom) {
            userAccountForClient = {
              ...userAccountForClient,
              siteVisitReasonsCustom,
            };
          }

          if (siteVisitReasonsDefault) {
            userAccountForClient = {
              ...userAccountForClient,
              siteVisitReasonsDefault,
            };
          }

          if (gradesTaught) {
            userAccountForClient = {
              ...userAccountForClient,
              gradesTaught,
            };
          }

          if (gradesType) {
            userAccountForClient = {
              ...userAccountForClient,
              gradesType,
            };
          }

          if (referredByDefault) {
            userAccountForClient = {
              ...userAccountForClient,
              referredByDefault,
            };
          }

          if (subjects && Object.entries(subjects).length > 0) {
            const subjectsTeaching = new Map(Object.entries(subjects));
            userAccountForClient = {
              ...userAccountForClient,
              subjects: subjectsTeaching as Map<string, string>,
            };
          } else if (subjects && Object.entries(subjects).length == 0) {
            userAccountForClient.subjects = userAccountDefault.subjects;
          }

          if (
            gradesOrYears &&
            Object.entries(gradesOrYears).length > 0 &&
            gradesOrYears.selection
          ) {
            userAccountForClient.gradesOrYears = gradesOrYears;
          } else if (
            gradesOrYears &&
            (Object.entries(gradesOrYears).length === 0 ||
              !gradesOrYears.selection ||
              !gradesOrYears?.ageGroupsTaught?.length)
          ) {
            userAccountForClient.gradesOrYears = {
              selection: "U.S.",
              ageGroupsTaught: [],
            };
          }

          if (
            userAccount &&
            (Object.entries(userAccount).length === 0 ||
              !gradesOrYears?.selection ||
              !gradesOrYears?.ageGroupsTaught?.length)
          ) {
            userAccount.gradesOrYears = {
              selection: "U.S.",
              ageGroupsTaught: [],
            };
          }

          if (zipCode) {
            userAccountForClient.zipCode = zipCode;
          }

          if (country) {
            userAccountForClient.country = country;
          }

          if (occupation) {
            userAccountForClient.occupation = occupation;
          }

          if (firstName || lastName) {
            userAccountForClient = {
              ...userAccountForClient,
              firstName: firstName ?? name?.first,
              lastName: lastName ?? name?.first,
            };
          }

          console.log("userAccountForClient: ", userAccountForClient);

          userAccountForClient.isTeacher = isTeacher ?? false;

          localStorage.setItem("userAccount", JSON.stringify(userAccount));

          setAboutUserForm(userAccountForClient);
        } catch (error) {
          console.error('Failed to get "AboutUser" form. Reason: ', error);
        } finally {
          setTimeout(() => {
            setIsRetrievingUserData(false);
          }, 250);
        }
      })();
      return;
    } else if (status === "unauthenticated") {
      setIsRetrievingUserData(false);
    }
  }, [status]);

  return {
    _aboutUserForm,
    _isRetrievingUserData: [isRetrievingUserData, setIsRetrievingUserData],
    user,
    status,
    data,
    token,
    _gpPlusSub: [gpPlusSub, setGpPlusSub],
  } as const;
};
