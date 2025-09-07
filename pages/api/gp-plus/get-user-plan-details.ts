/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */

import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../../nondependencyFns";
import { getUserByEmail } from "../../../backend/services/userServices";
import { getGpPlusMembership, getPlans } from "../../../backend/services/outsetaServices";
import { CustomError } from "../../../backend/utils/errors";
import { calculatePercentSaved } from "../../../shared/fns";
import { IPlanDetails } from "../../../apiServices/user/crudFns";

type TReqQueryParams = {
  willComputeSavings: boolean
  willGetUserPlan: boolean
}

export default async function handler(request: NextApiRequest, response: NextApiResponse){
  try {
    const authHeader = request.headers["authorization"];
    const willComputeSavings = "willComputeSavings" in request.query ? request.query.willComputeSavings : false;

    throw new Error("error");

    if (!authHeader) {
      return response.status(401).json({
        errType: "Unauthorized",
        message: "Authorization header not found",
      });
    }

    const token = authHeader?.split(" ")[1];
    const jwtVerificationResult = await verifyJwt(token);
    const targetUser = await getUserByEmail(jwtVerificationResult.payload.email)
    
    if(!targetUser){
      return response.status(404).json({
        errType: "Unauthorized",
        message: "User not found",
      });
    }

    const gpPlusMembership = await getGpPlusMembership(jwtVerificationResult.payload.email);

    if(!gpPlusMembership || (gpPlusMembership.AccountStageLabel === "NonMember")){
      throw new CustomError({
        message: "The user doesn't have a GP+ subscription",
        status: 404,
        errType: "gpPlusSubNotFound",
      });
    }

    const plans = await getPlans();

    if(!plans?.length){
      throw new CustomError({
        message: "No GP+ plans found",
        status: 404,
        errType: "gpPlusPlansNotFound",
      });    
    }

    const targetPlan = plans.find(plan => {
      return plan.Name === gpPlusMembership.PlanName;
    });

    if(!targetPlan){
      throw new CustomError({
        message: `The user is subscribed to a GP+ plan that doesn't exist. Plan name: ${gpPlusMembership.PlanName}`,
        status: 404,
        errType: "gpPlusPlanNotFound",
      });
    }

    let percentageSaved: number | undefined;

    if(willComputeSavings){
      const monthlyRateForYearlyPlan = Math.ceil(targetPlan.AnnualRate / 12)
      percentageSaved = calculatePercentSaved(targetPlan.MonthlyRate, monthlyRateForYearlyPlan);
    }

    return response.status(200).json({ currentUserPlan: targetPlan, percentageSaved } as IPlanDetails);
  } catch (error: any) {
    console.error("Failed to get the user's GP+ plan details. Reason: ", error);

    return response.status(error.status || 500).json({
      errType: error.errType ?? "failedToGetUserPlanDetails",
      message: error.message ?? "Failed to get the target user plan.",
    });
  }
};