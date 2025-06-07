import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../../backend/utils/connection";
import {
  executeUserCrudOperationsWithRetries,
  getUsers,
  migrateUserToV2,
} from "../../../backend/services/userServices";
import { IUserSchema, TUserSchemaV2 } from "../../../backend/models/User/types";
import { AnyBulkWriteOperation } from "mongoose";

const IS_V2_MIGRATION_DONE = true;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if(IS_V2_MIGRATION_DONE) {
      return response.status(410).json({ error: "Migration already done" });
    }

    console.log("hey there, migrating users!");
    if (request.method !== "PUT") {
      return response.status(405).json({ error: "Method not allowed" });
    }

    await connectToMongodb(10_000, 0, true, request.body.dbType ?? "dev");

    const { errMsg, users: oldUsers } = await getUsers<
      TUserSchemaV2 & IUserSchema
    >();

    console.log(`The length of oldUsers is ${oldUsers?.length}.`);

    if (!oldUsers?.length || errMsg) {
      return response
        .status(500)
        .json({ error: errMsg || "Failed to get all users." });
    }

    const usersToUpdate: AnyBulkWriteOperation<TUserSchemaV2>[] = [];

    // get all of the users
    // filter out all of the users that don't need to be updated
    // send them to the client after the migrations has occurred
    // on the client side, check if the migration was successful by:

    // END GOAL: for the users verion prior to migration, their properties that needed to be migrated are
    // present in the user object queried from the db, check for that

    // for the comparison of the values, if the value is an array, all of the values in the array of the depracted user
    // -must be present the new migrated user

    // the properties that needed to be migrated are present in the migrated user
    // using the key get the property from the user retrieved from the db
    // loop through it
    // change the return value of migrateUserToV2 to key val pairs array
    // get the fields that need to be migrated using the function migrateUserToV2
    // go through all of the users prior to the migration
    // pass the user retrieved from the db and the user version prior to migration
    const usersToUpdateFromDb = [];

    for (const user of oldUsers) {
      const userMigration = migrateUserToV2(user);
      const userMigrationKeys = Object.keys(userMigration);

      if (userMigrationKeys.length && user._id) {
        usersToUpdate.push({
          updateOne: {
            filter: { _id: user._id },
            update: userMigration,
          },
        });
        usersToUpdateFromDb.push(user);

        continue;
      }

      if (!user._id) {
        console.error("The '_id' is not present.");
        continue;
      }

      if (!userMigrationKeys.length) {
        console.log("The user is not using any of the depracted fields.");
      }
    }

    console.log("Users to update: ", usersToUpdate.length);

    console.log("Will execute the user migration operations.");

    const migrationResult = await executeUserCrudOperationsWithRetries(usersToUpdate, 5);

    console.log("migrationResult: ", migrationResult);

    if (!migrationResult.isOk()) {
      console.error(
        "An unexpected error occurred during the user migration operations."
      );
    }

    console.log("Successfully migrated all users from v1 to v2.");
    console.log("Will remove the deprecated fields.");

    response.status(200).json({
      message: "Successfully migrated all users from v1 to v2.",
      usersToUpdateFromDb,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error: "Internal Server Error" });
  }
}
