import { NextApiRequest, NextApiResponse } from "next";
import { deleteUser } from "../../../backend/services/userServices";
import { connectToMongodb } from "../../../backend/utils/connection";
import { CustomError } from "../../../backend/utils/errors";
import { TEnvironment } from "../../../types/global";
import User from "../../../backend/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dbType, userIds } = req.query as { dbType: TEnvironment, userIds: string[] };

  console.log("total users to delete: ", userIds.length);

  try {
    await connectToMongodb(15_000, 0, true, dbType ?? "dev");

    const deletionResult = await User.deleteMany({ _id: { $in: userIds } });

    if(deletionResult.deletedCount === 0) {
      throw new CustomError("Failed to delete the target users.", 500);
    }

    res.status(200).json({ wasSuccessful: true });
  } catch (error:any) {
    console.error("Failed to delete the target user. Reason: ", error);

    res.status(500).json({ wasSuccessful: false, errMsg: error.message ?? "Failed to delete the target users." });
  }
}
