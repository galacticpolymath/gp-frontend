/* eslint-disable no-console */
/* eslint-disable indent */
import { sleep } from "../../globalFns.js";
import { createDocument } from "../db/utils.js";
import { v4 as uuidv4 } from "uuid";
import { IUserSchema, TDefaultSubject, TUserSchemaForClient } from "../models/User/types.js";
import User from "../models/User/index";

export const getUsers = async (queryObj = {}, projectionObj = {}) => {
    try {
        const users = await User.find(queryObj, projectionObj).lean();

        return { users };
    } catch (error) {
        return { errMsg: `Unable to retrieve all users. Reason: ${error}` };
    }
};

export const getUser = async (queryObj = {}, projectionObj = {}) => {
    try {
        const user = await User.findOne(queryObj, projectionObj)
            .maxTimeMS(7_000)
            .lean();

        return { user };
    } catch (error: any) {
        console.error("An error has occurred in getting the target user: ", error);
        console.log(error);
        const didTimeoutOccur = error?.error?.codeName === "MaxTimeMSExpired";

        return {
            errType: didTimeoutOccur ? "timeout" : "general",
        };
    }
};

/**
 * @description
 * Gets a user document from the database with a maximum timeout of 7 seconds.
 * If a timeout occurs, the function will retry up to 3 times before returning an error.
 * @param {object} queryObj - The query object to find the target user.
 * @param {object} projectionObj - The projection object to select the properties of the target user.
 * @param {number} tries - The number of times the function has been retried.
 * @returns {Promise<{user: UserSchema} | {errType: 'timeout' | 'general'}>}
 */
export const getUserWithRetries = async (
    queryObj: any,
    projectionObj: any,
    tries: number
): Promise<{ user?: Partial<IUserSchema>, errType?: string }> => {
    try {
        console.log("retrieving user...");
        console.log("Current try: ", tries);
        const user = await User.findOne(queryObj, projectionObj)
            .maxTimeMS(5_500)
            .lean();

        return { user: user as Partial<IUserSchema> };
    } catch (error: any) {
        console.log("Failed to get the target user.");
        if (tries <= 3) {
            console.log("Will try again.");
            tries += 1;
            const randomNumMs = Math.floor(Math.random() * (5_500 - 1000 + 1)) + 1000;
            const waitTime = randomNumMs + tries * 1_000;

            await sleep(waitTime);

            return getUserWithRetries(queryObj, projectionObj, tries);
        }

        const didTimeoutOccur = error?.error?.codeName === "MaxTimeMSExpired";

        console.error("An error has occurred in getting the target user: ", error);
        console.log(error);

        return {
            errType: didTimeoutOccur ? "timeout" : "general",
        };
    }
};

export const handleUserDeprecatedV1Fields = (user: TUserSchemaForClient) => {
    if(user.classroomSize && typeof user.classSize === "undefined"){
        user = {
            ...user,
            classSize: user.classroomSize.num,
        }
    }

    if(user.classroomSize && typeof user.isNotTeaching === "undefined"){
        user = {
            ...user,
            isNotTeaching: user.classroomSize.isNotTeaching,
        }
    }
    
    if(user.gradesOrYears && typeof user.gradesType === "undefined"){
        user = {
            ...user,
            gradesType: user.gradesOrYears.selection,
        }
    }

    if(user.gradesOrYears && typeof user.gradesTaught === "undefined"){
        user = {
            ...user,
            gradesTaught: user.gradesOrYears.ageGroupsTaught,
        }
    }

    if(user.name && typeof user.firstName === "undefined"){
        user = {
            ...user,
            firstName: user.name.first,
        }
    }

    if(user.name && typeof user.lastName === "undefined"){
        user = {
            ...user,
            lastName: user.name.last,
        }
    }

    if(user.reasonsForSiteVisit && typeof user.siteVisitReasonsDefault === "undefined"){
        const defaultSelectionsEntries = Object.entries(user.reasonsForSiteVisit as Record<string, string>)
            .filter(([key, _]) => {
                const keySplitted = key.split("-")
                const lastChar = keySplitted.at(-1);

                return typeof lastChar === "string" && lastChar !== "custom" && !isNaN(parseInt(lastChar))
            })
        
        defaultSelectionsEntries.sort(([selectionAKey,], [selectionBKey,]) => selectionAKey.localeCompare(selectionBKey))

        user = {
            ...user,
            siteVisitReasonsDefault: defaultSelectionsEntries.map(([_, value]) => value)
        };
    }
    
    if(user.reasonsForSiteVisit && user.reasonsForSiteVisit["reason-for-visit-custom"] && typeof user.siteVisitReasonsCustom === "undefined"){
        user = {
            ...user,
            siteVisitReasonsCustom: user.reasonsForSiteVisit["reason-for-visit-custom"] as string
        };
    }

    // && typeof user.subjectsTaughtCustom === "undefined"

    if(user.subjects && typeof user.subjectsTaughtDefault === "undefined"){
        const subjectEntries = Object.entries(user.subjects as Record<string, string>);
        const defaultSubjects: [string, string][] = [];
        const customSubjects: [string, string][] = [];

        for(const [key, _] of subjectEntries){
            if(!key.includes("other-subject")){
                defaultSubjects.push([key, _]);
                continue;
            }

            if(key.includes("other-subject")){
                customSubjects.push([key, _]);
            }
        }

        if(defaultSubjects.length){
            defaultSubjects.sort(([subjectAKey,], [subjectBKey,]) => subjectAKey.localeCompare(subjectBKey))
        }

        if(customSubjects.length){
            customSubjects.sort(([subjectAKey,], [subjectBKey,]) => subjectAKey.localeCompare(subjectBKey))
        }


        user = {
            ...user,
            subjectsTaughtDefault: defaultSubjects?.length ? defaultSubjects.map(([_, value]) => value) as TDefaultSubject[] : [],
            subjectsTaughtCustom: customSubjects?.length ? customSubjects.map(([_, value]) => value) : []
        };
    }

    return user;
}

export const getUserByEmail = async <TUser extends IUserSchema,>(email = "", projectionsObj = {}) => {
    try {
        const targetUser = await User.findOne(
            { email: email },
            projectionsObj
        ).lean();

        console.log("targetUser, sup there: ", targetUser);

        return targetUser as TUser;
    } catch (error) {
        console.error(
            "Failed to receive the target user via email. Reason: ",
            error
        );

        return null;
    }
};

export const updateUser = async (
    filterQuery = {},
    updatedUserProperties: Omit<Partial<IUserSchema>, "password">,
    updatedUserPropsToFilterOut?: (keyof IUserSchema)[]
) => {
    try {
        if (updatedUserProperties.isTeacher === false) {
            updatedUserProperties = {
                ...updatedUserProperties,
                gradesOrYears: {
                    ageGroupsTaught: [],
                    selection: null,
                },
                isNotTeaching: true,
                gradesTaught: []
            };
        }
        const updatedUser = await User.findOneAndUpdate(
            filterQuery,
            updatedUserProperties,
            { new: true }
        ).lean();

        if (!updatedUser) {
            console.error(
                'The target user does not exist. Check "filterQuery" object.'
            );

            return { wasSuccessful: false };
        }

        if (updatedUserPropsToFilterOut?.length) {
            const entries = Object.entries(updatedUser as Partial<IUserSchema>);

            const updateUserWithProjectedProps = entries.reduce(
                (updatedUserWithProjectedPropsAccum, [key, value]) => {
                    if (updatedUserPropsToFilterOut?.includes(key as keyof IUserSchema)) {
                        return updatedUserWithProjectedPropsAccum;
                    }

                    return {
                        ...updatedUserWithProjectedPropsAccum,
                        [key]: value,
                    };
                },
                {}
            );

            return { wasSuccessful: true, updatedUser: updateUserWithProjectedProps };
        }

        return { wasSuccessful: true, updatedUser: updatedUser as Partial<IUserSchema> };
    } catch (error) {
        const { message } = error as { message?: string };
        const errMsg =
            message ?? `The target user failed to be updated. Reason: ${error}`;

        console.log(errMsg);

        return { wasSuccessful: false, errMsg };
    }
};

export const deleteUser = async (query = {}) => {
    try {
        if (
            !query ||
            Object.keys(query).length === 0 ||
            (query && typeof query !== "object") ||
            Array.isArray(query)
        ) {
            throw new Error(
                '"query" must be a non-array object. The "query" argument cannot be an empty object.'
            );
        }

        await User.deleteOne(query);

        return { wasSuccessful: true };
    } catch (error) {
        console.error("Failed to delete the target user. Reason: ", error);

        return { wasSuccessful: false };
    }
};

export const deleteUserById = async (userId: string) => {
    try {
        await User.deleteOne({ _id: userId });

        return { wasSuccessful: true };
    } catch (error) {
        console.error("The target user failed to be updated. Reason: ", error);

        return { wasSuccessful: false };
    }
};

export const deleteUserByEmail = async (email: string) => {
    try {
        await User.deleteOne({ email: email });

        return { wasSuccessful: true };
    } catch (error) {
        console.error("The target user failed to be updated. Reason: ", error);

        return { wasSuccessful: false };
    }
};

/**
 * Creates a database user.
 * @param {string} email
 * @param {string | null} password
 * @param {string} providerAccountId
 * @param {"google" | "credentials"} provider
 * @param {string[]} roles "dbAdmin" | "user"
 * @param {{ first: string, last: string }} [name]
 * */
export const createUser = async (
    email: string,
    password: string | null,
    provider: "google" | "credentials",
    roles: ("dbAdmin" | "user")[],
    providerAccountId: string,
    name?: { first: string, last: string }
) => {
    try {
        const userDocument = createDocument(
            {
                _id: uuidv4(),
                providerAccountId,
                email: email,
                password: password,
                provider: provider,
                roles: roles,
                name: name,
            },
            User
        );

        if(!userDocument){
            throw new Error("Failed to create the user document.");
        }

        await userDocument.save();

        return { wasSuccessful: true, createdUser: userDocument };
    } catch (error) {
        const errMsg = `Failed to create the target user into the db. Reason: ${error}`;

        console.error(errMsg);

        return { wasSuccessful: false, msg: errMsg };
    }
};
