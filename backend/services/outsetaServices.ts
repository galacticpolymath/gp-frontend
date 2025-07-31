import axios, { AxiosHeaders } from "axios";

const OUTSETA_API_ORIGIN = "https://galactic-polymath.outseta.com";
const OUTSETA_API_VERSION_PATH = "api/v1";
const OUTSETA_REST_API_ORIGIN = `${OUTSETA_API_ORIGIN}/${OUTSETA_API_VERSION_PATH}`;

export interface IOutsetaAuthTokenResBody {
  access_token: string;
  expires_in: number;
  token_type: string;
}
type TPerson = {
  Email: string;
  Uid: string;
  [key: string]: unknown;
};

export type TAccountStageLabel =
  | "Subscribing"
  | "Cancelling"
  | "Past due"
  | "Expired"
  | "NonMember";

export interface IOutsetaUser {
  Name?: string;
  PersonAccount?: { Person: TPerson }[];
  AccountStageLabel: TAccountStageLabel;
  CurrentSubscription: {
    _objectType: "Subscription";
    StartDate: string;
    RenewalDate: string;
    Created: string;
    /**
     * `1` = Monthly, `2` = Yearly
     */
    BillingRenewalTerm: keyof TBillingRenewalTerm;
    Rate: TBillingRenewalTerm[keyof TBillingRenewalTerm][1];
    Plan: {
      Name: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface IOutsetaPagination<TData extends object = IOutsetaUser> {
  metadata: Record<"limit" | "offset" | "total", number>;
  items: TData[] | null;
}

/**
 * Represents billing renewal terms related to Outseta's `BillingRenewalTerm` property of the `CurrentSubscription` object.
 * The keys correspond to the billing period:
 * 1 for Monthly and 2 for Yearly.
 *
 * Each entry contains a tuple where the first element is the name of the billing period and the second element is charge amount per period.
 */
export type TBillingRenewalTerm = {
  1: ["Monthly", 10];
  2: ["Yearly", 60];
};

export interface TOutsetaSubscription {
  _objectType: "Subscription";
  BillingRenewalTerm: keyof TBillingRenewalTerm;
}

const headers = {
  Authorization: `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_API_SECRET}`,
  "Content-Type": "application/json"
}

export const getBillingType = (billingTypeNum: keyof TBillingRenewalTerm) => {
  const BILLING_RENEWAL_TERM: TBillingRenewalTerm = {
    1: ["Monthly", 10],
    2: ["Yearly", 60],
  };

  return BILLING_RENEWAL_TERM[billingTypeNum];
};

export type TGpPlusMembershipRetrieved = Awaited<
  ReturnType<typeof getGpPlusIndividualMembershipStatus>
> & { AccountStageLabel: TAccountStageLabel | "NonMember" };

export const getGpPlusIndividualMembershipStatus = async (
  email: string,
  fields = "CurrentSubscription.*, CurrentSubscription.Plan.*, AccountStageLabel, Name, PersonAccount.Person.*"
) => {
  try {
    console.log(
      `Attempting to retrieve Outseta GP+ membership status for: ${email}`
    );

    const url = new URL(
      `${OUTSETA_API_ORIGIN}/${OUTSETA_API_VERSION_PATH}/crm/accounts/`
    );

    url.searchParams.append("Name", email);
    url.searchParams.append("Fields", fields);

    const { status, data } = await axios.get<IOutsetaPagination>(url.href, {
      headers: {
        Authorization: `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_API_SECRET}`,
        "Content-Type": "application/json",
      },
    });
    const currentSubscription = data.items?.[0];

    console.log("currentSubscription, sup there: ", currentSubscription);

    console.log("Status code: ", status);

    if (status !== 200 || !currentSubscription) {
      console.error("Failed to retrieve Outseta GP+ membership status.");

      throw new Error("accountRetrievalErr");
    }

    const persons = currentSubscription.PersonAccount;
    const person = persons?.[0]?.Person;
    const { AccountStageLabel } = currentSubscription;
    const { BillingRenewalTerm, Created, Plan, Rate, RenewalDate, StartDate } =
      currentSubscription.CurrentSubscription ?? {};

    return {
      email: currentSubscription.Name,
      BillingRenewalTerm,
      Created,
      Rate,
      RenewalDate,
      StartDate,
      PlanName: Plan?.Name ?? null,
      AccountStageLabel,
      person,
    };
  } catch (error: any) {
    console.error(
      "Failed to retrieve the outseta status for the target user. Error: ",
      error?.response
    );
    console.error("Error object: ", error);

    return {
      AccountStageLabel: "NonMember",
    };
  }
};

export const deletePerson = async (personId: string) => {
  try {
    const url = `${OUTSETA_REST_API_ORIGIN}/crm/people/${personId}`
    const { status } = await axios.delete(url, { headers: headers });

    if(status !== 204){
      throw new Error("Failed to delete the target person.")
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    console.error("An error has occurred. Failed to delete the target person: ", error);

    return { wasSuccessful: false, errObj: error };
  }
};

export const deleteAccount = async (accountId: string) => {
  try {
    const url = `${OUTSETA_REST_API_ORIGIN}/crm/accounts/${accountId}`
    const { status } = await axios.delete(url, { headers: headers });

    if(status !== 204){
      throw new Error("Failed to delete the target account.")
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    console.error("An error has occurred. Failed to delete the target person: ", error);

    return { wasSuccessful: false, errObj: error };
  }
};
