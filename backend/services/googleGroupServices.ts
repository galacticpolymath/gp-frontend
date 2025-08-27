import { admin_directory_v1 } from "googleapis";
import { createGoogleAdminService as _createGoogleAdminService } from "./gdriveServices";

const GP_PLUS_GROUP_ID = "01fob9te1logy92";

export const createGoogleAdminService = async () => {
  const googleAdminService = await _createGoogleAdminService(
    ["https://www.googleapis.com/auth/admin.directory.group"],
    { subject: "matt@galacticpolymath.com" }
  );

  return googleAdminService;
};

export const getGoogleGroupMember = async (
  email: string,
  googleAdminServices?: admin_directory_v1.Admin
) => {
  try {
    let _googleAdminServices = googleAdminServices;

    if (!googleAdminServices) {
      _googleAdminServices = await createGoogleAdminService();
    }
    
    console.log(`Retrieving google group member for ${email}`);

    const googleGroupMember = await _googleAdminServices!.members.get({
      groupKey: GP_PLUS_GROUP_ID,
      memberKey: email,
    });

    return googleGroupMember.data;
  } catch (error: any) {
    console.error("An error occurred, sup there: ", error);
    console.error("error response: ", error.response);
    console.error("error response, java: ", error?.response?.data);

    return null;
  }
};

export const insertGoogleGroupMember = async (
  email: string,
  googleAdminServices?: admin_directory_v1.Admin
) => {
  try {
    console.log(`Adding ${email} to Google group`);

    let _googleAdminServices = googleAdminServices;

    if (!googleAdminServices) {
      _googleAdminServices = await createGoogleAdminService();
    }

    const googleGroupMember = await _googleAdminServices!.members.insert({
      groupKey: GP_PLUS_GROUP_ID,
      requestBody: {
        email: email,
      },
    });

    console.log("googleGroupMember, hey there: ", googleGroupMember.data);
    
    if (!googleGroupMember.ok){
        throw new Error(`Failed to insert user into Google group. Email: ${email}.`);
    }

    return {
        wasSuccessful: true,
        member: googleGroupMember.data
    };
  } catch (error: any) {
    console.error("An error occurred, sup there: ", error);
    console.error("error response: ", error.response);
    console.error("error response, java: ", error.response.data.error);

    return {
        wasSuccessful: false
    };
  }
};

export const deleteGoogleGroupMember = async (
  email: string,
  googleAdminServices?: admin_directory_v1.Admin
) => {
  try {
    let _googleAdminServices = googleAdminServices;

    if (!googleAdminServices) {
      _googleAdminServices = await createGoogleAdminService();
    }

    const googleGroupMember = await _googleAdminServices!.members.delete({
      groupKey: GP_PLUS_GROUP_ID,
      memberKey: email
    });

    console.log("googleGroupMember: ", googleGroupMember);

    return {
        wasSuccessful: googleGroupMember.ok
    };
  } catch (error: any) {
    console.error("An error occurred, sup there: ", error);
    console.error("error response: ", error.response);
    console.error("error response, java: ", error.response.data.error);

    return {
        wasSuccessful: false
    };
  }
};
