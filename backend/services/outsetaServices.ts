import axios, { AxiosHeaders } from 'axios';
import { sleep, waitWithExponentialBackOff } from '../../globalFns';
import { calculatePercentSaved } from '../../shared/fns';

const OUTSETA_API_ORIGIN = 'https://galactic-polymath.outseta.com';
const OUTSETA_API_VERSION_PATH = 'api/v1';
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
  | 'Subscribing'
  | 'Cancelling'
  | 'Past due'
  | 'Active'
  | 'Trialing'
  | 'Trial'
  | 'Expired'
  | 'NonMember';

export interface IOutsetaUser {
  Uid: string;
  Name?: string;
  PersonAccount?: { Person: TPerson }[];
  AccountStageLabel: TAccountStageLabel;
  CurrentSubscription: {
    _objectType: 'Subscription';
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
  metadata: Record<'limit' | 'offset' | 'total', number>;
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
  1: ['Monthly', 10];
  2: ['Yearly', 60];
};

export interface TOutsetaSubscription {
  _objectType: 'Subscription';
  BillingRenewalTerm: keyof TBillingRenewalTerm;
}

const headers = {
  Authorization: `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_API_SECRET}`,
  'Content-Type': 'application/json',
};

export const getBillingType = (billingTypeNum: keyof TBillingRenewalTerm) => {
  const BILLING_RENEWAL_TERM: TBillingRenewalTerm = {
    1: ['Monthly', 10],
    2: ['Yearly', 60],
  };

  return BILLING_RENEWAL_TERM[billingTypeNum];
};

export interface IPlan {
  Name: string;
  MonthlyRate: number;
  AnnualRate: number;
  [key: string]: unknown;
}

interface IPlansPagination {
  items?: IPlan[];
  [key: string]: unknown;
}

const getCanRetry = (error: any) => {
  const isNetworkError =
    error?.code === 'ECONNRESET' ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT';
  const isTimeoutError =
    error?.code === 'ECONNABORTED' ||
    error?.message?.includes('timeout') ||
    error?.response?.status === 408;

  return isNetworkError || isTimeoutError;
};

export const getPlans = async () => {
  try {
    const { status, data } = await axios.get<IPlansPagination>(
      `${OUTSETA_REST_API_ORIGIN}/billing/plans`,
      {}
    );

    if (status !== 200) {
      throw new Error(`Failed to retrieve plans. Status code: ${status}`);
    }

    if (!data?.items) {
      throw new Error(
        'An unexpected error occurred. Please try again later. Plans not available.'
      );
    }

    return data?.items;
  } catch (error) {
    console.error('Error retrieving plans:', error);

    return null;
  }
};

export type TGpPlusMembershipRetrieved = Awaited<
  ReturnType<typeof getGpPlusMembership>
> & { AccountStageLabel: TAccountStageLabel | 'NonMember' };

export type TGpPlusMembership = Partial<{
  email: string;
  Uid: string;
  BillingRenewalTerm: keyof TBillingRenewalTerm;
  Created: string;
  Rate: number;
  RenewalDate: string;
  StartDate: string;
  PlanName: string | null;
  person: TPerson;
}> & { AccountStageLabel: TAccountStageLabel | 'NonMember' };

export const NON_MEMBER_STATUSES = new Set<TAccountStageLabel>([
  'Expired',
  'NonMember',
]);

export const isActiveGpPlusMembership = (
  membership: { AccountStageLabel?: TAccountStageLabel | 'NonMember' } | null
) => {
  const label = membership?.AccountStageLabel;
  if (!label) return false;
  return !NON_MEMBER_STATUSES.has(label as TAccountStageLabel);
};

export const getGpPlusMembership = async (
  email: string,
  tries = 3,
  fields = 'CurrentSubscription.*, CurrentSubscription.Plan.*, AccountStageLabel, Name, PersonAccount.Person.*, Uid'
): Promise<TGpPlusMembership> => {
  try {
    console.log(
      `Attempting to retrieve Outseta GP+ membership status for: ${email}`
    );
    console.log('the email yo: ', email);

    const url = new URL(
      `${OUTSETA_API_ORIGIN}/${OUTSETA_API_VERSION_PATH}/crm/accounts/`
    );

    url.searchParams.append('Name', email);
    url.searchParams.append('Fields', fields);

    const { status, data } = await axios.get<IOutsetaPagination>(url.href, {
      headers: {
        Authorization: `Outseta ${process.env.OUTSETA_API_KEY}:${process.env.OUTSETA_API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('data, bacon: ', data);

    const currentSubscription = data.items?.[0];

    console.log('Status code: ', status);

    if (status !== 200 || !currentSubscription) {
      console.error('Failed to retrieve Outseta GP+ membership status.');

      throw new Error('accountRetrievalErr');
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
      Uid: currentSubscription.Uid,
    };
  } catch (error: any) {
    console.error(
      'Failed to retrieve the outseta status for the target user. Error: ',
      error?.response
    );
    console.error('Error object: ', error);

    const canRetry = getCanRetry(error);

    if (canRetry && tries > 0) {
      console.error(
        'Retryable error occurred while retrieving GP+ membership. Will retry...'
      );

      await waitWithExponentialBackOff(tries);

      return await getGpPlusMembership(email, tries, fields);
    }

    return {
      AccountStageLabel: 'NonMember',
    };
  }
};

interface ICRUDResultOutseta {
  wasSuccessful: boolean;
  errObj?: unknown;
}

export const deletePerson = async (
  personId: string,
  tries = 3
): Promise<ICRUDResultOutseta> => {
  try {
    const url = `${OUTSETA_REST_API_ORIGIN}/crm/people/${personId}`;
    const { status } = await axios.delete(url, { headers: headers });

    if (status !== 200) {
      throw new Error('Failed to delete the target person.');
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    console.error(
      'An error has occurred. Failed to delete the target person, keys: ',
      error
    );
    console.error(
      'An error has occurred. Failed to delete the target person, error response: ',
      error.response
    );

    const isNetworkError =
      error?.code === 'ECONNRESET' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT';
    const isTimeoutError =
      error?.code === 'ECONNABORTED' ||
      error?.message?.includes('timeout') ||
      error?.response?.status === 408;

    if ((isNetworkError || isTimeoutError) && tries > 0) {
      await waitWithExponentialBackOff(tries);

      return await deletePerson(personId, tries - 1);
    }

    return { wasSuccessful: false, errObj: error };
  }
};

export const getSavings = async () => {
  try {
    const plans = await getPlans();
    const plusPlan = plans
      ? plans.find((plan) => plan.Name === 'Galactic Polymath Plus')
      : undefined;
    let plusPlanPercentSaved: number | undefined;

    if (plans?.length && plusPlan) {
      const monthlyRateForYearlyPlan = Math.ceil(plusPlan.AnnualRate / 12);
      plusPlanPercentSaved = calculatePercentSaved(
        plusPlan.MonthlyRate,
        monthlyRateForYearlyPlan
      );
    }

    return {
      individualGpPlusPlanSavings: plusPlanPercentSaved,
    };
  } catch (error) {
    console.error('An error has occurred. Failed to get savings: ', error);

    return null;
  }
};

export const deleteAccount = async (
  accountId: string,
  tries = 3
): Promise<ICRUDResultOutseta> => {
  try {
    console.log(`Attempting to delete account with accountId: ${accountId}`);

    const url = `${OUTSETA_REST_API_ORIGIN}/crm/accounts/${accountId}`;
    const response = await axios.delete(url, { headers: headers });
    console.log('deleteAccount response: ', response);
    const { status } = response;

    if (status != 200) {
      throw new Error('Failed to delete the target account.');
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    console.error(
      'An error has occurred. Failed to delete the target account, keys: ',
      error
    );
    console.error(
      'An error has occurred. Failed to delete the target account, response: ',
      error.response
    );

    const isNetworkError =
      error?.code === 'ECONNRESET' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT';
    const isTimeoutError =
      error?.code === 'ECONNABORTED' ||
      error?.message?.includes('timeout') ||
      error?.response?.status === 408;

    if ((isNetworkError || isTimeoutError) && tries > 0) {
      console.log(
        `Retrying account deletion for accountId: ${accountId}, attempts remaining: ${tries - 1
        }`
      );

      await waitWithExponentialBackOff(tries);

      return await deleteAccount(accountId, tries - 1);
    }

    return { wasSuccessful: false, errObj: error };
  }
};
