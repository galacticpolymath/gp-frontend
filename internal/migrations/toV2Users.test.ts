import fs from "fs";
import axios from "axios";
import {
  IAboutUserFormNewFieldsV1,
  IUserSchema,
  TDefaultSubject,
  TUserSchemaForClient,
  TUserSchemaV2,
} from "../../backend/models/User/types";
import readline from "node:readline";
import { TEnvironment } from "../../types/global";

const migrateUserToV2 = (user: TUserSchemaForClient) => {
  let migratedVals: Partial<IAboutUserFormNewFieldsV1> = {};

  if (
    typeof user.classroomSize?.num === "number" &&
    typeof user.classSize === "undefined"
  ) {
    migratedVals = {
      classSize: user.classroomSize.num ?? 0,
    };
  }

  if (
    typeof user.classroomSize?.isNotTeaching === "boolean" &&
    typeof user.isNotTeaching === "undefined"
  ) {
    migratedVals = {
      ...migratedVals,
      isNotTeaching: user.classroomSize.isNotTeaching,
    };
  }

  if (
    user.gradesOrYears?.selection &&
    (typeof user.gradesType === "undefined" || !user.gradesType)
  ) {
    migratedVals = {
      ...migratedVals,
      gradesType: user.gradesOrYears.selection ?? null,
    };
    console.log("migratedVals, gradesType: ", migratedVals);
  }

  if (
    user.gradesOrYears?.ageGroupsTaught &&
    (typeof user.gradesTaught === "undefined" ||
      user.gradesTaught?.length === 0)
  ) {
    migratedVals = {
      ...migratedVals,
      gradesTaught: user.gradesOrYears.ageGroupsTaught ?? null,
    };
  }

  if (user.name && typeof user.firstName === "undefined") {
    migratedVals = {
      ...migratedVals,
      firstName: user.name.first ?? "",
    };
  }

  if (user.name && typeof user.lastName === "undefined") {
    migratedVals = {
      ...migratedVals,
      lastName: user.name.last ?? "",
    };
  }

  if (
    user.reasonsForSiteVisit &&
    (typeof user.siteVisitReasonsDefault === "undefined" ||
      user.siteVisitReasonsDefault?.length === 0)
  ) {
    const defaultSelectionsEntries = Object.entries(
      user.reasonsForSiteVisit
    ).filter(([key, _]) => {
      const keySplitted = key.split("-");
      const lastChar = keySplitted.at(-1);

      return (
        typeof lastChar === "string" &&
        lastChar !== "custom" &&
        !isNaN(parseInt(lastChar))
      );
    });

    defaultSelectionsEntries.sort(([selectionAKey], [selectionBKey]) =>
      selectionAKey.localeCompare(selectionBKey)
    );

    migratedVals = {
      ...migratedVals,
      siteVisitReasonsDefault: defaultSelectionsEntries.map(
        ([_, value]) => value as string
      ),
    };
  }

  if (
    user.reasonsForSiteVisit &&
    user.reasonsForSiteVisit["reason-for-visit-custom"] &&
    (typeof user.siteVisitReasonsCustom === "undefined" ||
      user.siteVisitReasonsCustom === "")
  ) {
    migratedVals = {
      ...migratedVals,
      siteVisitReasonsCustom: user.reasonsForSiteVisit[
        "reason-for-visit-custom"
      ] as string,
    };
  }

  if (
    user.subjects &&
    (typeof user.subjectsTaughtDefault === "undefined" ||
      user.subjectsTaughtDefault?.length === 0)
  ) {
    const subjectEntries = Object.entries(
      user.subjects as Record<string, string>
    );
    const defaultSubjects: [string, string][] = [];
    const customSubjects: [string, string][] = [];

    for (const [key, _] of subjectEntries) {
      // get the default subjects
      if (!key.includes("other-subject")) {
        defaultSubjects.push([key, _]);
        continue;
      }

      if (key.includes("other-subject")) {
        customSubjects.push([key, _]);
      }
    }

    if (defaultSubjects.length) {
      defaultSubjects.sort(([subjectAKey], [subjectBKey]) =>
        subjectAKey.localeCompare(subjectBKey)
      );
    }

    if (customSubjects.length) {
      customSubjects.sort(([subjectAKey], [subjectBKey]) =>
        subjectAKey.localeCompare(subjectBKey)
      );
    }

    migratedVals = {
      ...migratedVals,
      subjectsTaughtDefault: defaultSubjects?.length
        ? (defaultSubjects.map(([_, value]) => value) as TDefaultSubject[])
        : [],
      subjectsTaughtCustom: customSubjects?.length
        ? customSubjects.map(([_, value]) => value)
        : [],
    };
  }

  console.log("migratedVals, final: ", migratedVals);

  return migratedVals;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

test("Will perform user test migration to v2", async () => {
  try {
      const { MIGRATION_ACCESS_TOKEN } = process.env;
      const headers = {
        Authorization: `Bearer ${MIGRATION_ACCESS_TOKEN}`,
      };
      const dbType: TEnvironment = "dev";
      const resBody = { dbType };
      const latestSchemaAnswer = await ask(
        `Confirm that users database is using the latest schema interface without any depracated fields. Type 'y' to confirm? (y/n)\n`
      );

      if (latestSchemaAnswer !== "y") {
        console.log("Migration canceled.");
        return;
      }

      const answer = await ask(
        `The targeted database is ->'${resBody.dbType.toLowerCase()}'<-. Type 'y' to confirm and continue? (y/n)\n`
      );

      if (answer !== "y") {
        console.log("Migration canceled.");
        return;
      }

      const getUsersResBody = { dbType };
      const dbTypeAfterMigrationCheck = await ask(
        `The database ->'${getUsersResBody.dbType.toLowerCase()}'<- that will retrieve the users after the migration in order to perform the checks. Type 'y' to confirm and continue? (y/n)\n`
      );

      if (dbTypeAfterMigrationCheck !== "y") {
        console.log("Migration canceled.");
        return;
      }

      console.log("Will execute the migration...");

      const { data: migrationResult, status: migrationStatus } =
        await axios.put<{
          usersToUpdateFromDb: IUserSchema[];
        }>("http://localhost:3000/api/admin/migrate-to-v2-users", resBody, {
          headers,
        });

      console.log(`Migration status: ${migrationStatus}`);

      if (migrationStatus !== 200) {
        throw new Error(
          `Migration failed with status code ${migrationStatus}. ${migrationResult}`
        );
      }

      const { usersToUpdateFromDb: usersThatNeedToBeMigrated } =
        migrationResult;

      console.log(
        "Sleeping for 5000 ms before retrieving all users for migration check..."
      );

      await sleep(5000);

      const { data: allUsersResBody, status: allUsersStatus } =
        await axios.get<{
          users: Pick<TUserSchemaV2, keyof IAboutUserFormNewFieldsV1 | "_id">[];
        }>("http://localhost:3000/api/admin/get-all-raw-users", {
          headers,
          params: {
            dbType: getUsersResBody.dbType,
          },
        });

      console.log(`All users retrieval status: ${allUsersStatus}`);

      if (allUsersStatus !== 200) {
        throw new Error(
          `Failed to retrieve all users with status code ${allUsersStatus}. ${allUsersResBody}`
        );
      }

      const { users: usersAfterMigration } = allUsersResBody;
      const failedMigratedUsers: IUserSchema[] = [];

      console.log(
        `Number of users that need to be migrated: ${usersThatNeedToBeMigrated.length}`
      );

      console.log("Users after migration:");
      console.log(usersAfterMigration.length);
      console.log("Users that needed to be migrated:");
      console.log(usersThatNeedToBeMigrated.length);

      for (const userThatNeedToBeMigrated of usersThatNeedToBeMigrated) {
        const userAfterMigration = usersAfterMigration.find(
          (user) =>
            user._id.toString() === userThatNeedToBeMigrated._id.toString()
        );

        if (!userAfterMigration) {
          failedMigratedUsers.push(userThatNeedToBeMigrated);
          continue;
        }

        console.log("userAfterMigration._id: ", userAfterMigration._id);

        const userMigrationFields = migrateUserToV2(userThatNeedToBeMigrated);

        for (const [keyOfValToMigrate, valToMigrate] of Object.entries(
          userMigrationFields
        )) {
          console.log(`keyOfValToMigrate: ${keyOfValToMigrate}`);
          if (!(keyOfValToMigrate in userAfterMigration)) {
            if (
              !failedMigratedUsers.find(
                (user) => user._id === userThatNeedToBeMigrated._id
              )
            ) {
              failedMigratedUsers.push(userThatNeedToBeMigrated);
            }
            continue;
          }

          const migratedVal =
            userAfterMigration[
              keyOfValToMigrate as keyof Pick<
                TUserSchemaV2,
                keyof IAboutUserFormNewFieldsV1 | "_id"
              >
            ];

          console.log("migratedVal: ", migratedVal);
          console.log("valToMigrate: ", valToMigrate);

          if (
            Array.isArray(migratedVal) &&
            Array.isArray(valToMigrate) &&
            !valToMigrate.every((val) =>
              migratedVal.includes(val as TDefaultSubject)
            )
          ) {
            if (
              !failedMigratedUsers.find(
                (user) => user._id === userThatNeedToBeMigrated._id
              )
            ) {
              failedMigratedUsers.push(userThatNeedToBeMigrated);
            }
            continue;
          }

          if (Array.isArray(migratedVal) && Array.isArray(valToMigrate)) {
            console.log(
              "Values of array successfully migrated into their target array."
            );
            continue;
          }

          if (migratedVal !== valToMigrate) {
            console.error(
              `The field ${keyOfValToMigrate} has been failed to be migrated for user ${userThatNeedToBeMigrated._id}.`
            );

            console.log(`migratedVal: ${migratedVal}`);
            console.log(`valToMigrate: ${valToMigrate}`);

            if (
              !failedMigratedUsers.find(
                (user) => user._id === userThatNeedToBeMigrated._id
              )
            ) {
              failedMigratedUsers.push(userThatNeedToBeMigrated);
            }
            continue;
          }
        }
      }

      console.log(
        `Number of users that failed to migrate: ${failedMigratedUsers.length}`
      );

      if (failedMigratedUsers.length) {
        const failedMigratedUsersCount = failedMigratedUsers.length;

        console.log(
          `Number of failed migrated users: ${failedMigratedUsersCount}`
        );

        if (failedMigratedUsersCount) {
          fs.writeFileSync(
            "failedMigratedUsers.json",
            JSON.stringify(failedMigratedUsers, null, 2)
          );
        }

        throw new Error(
          "Some users failed to be migrated to the new schema. Please check the server logs for more information."
        );
      }

      console.log(
        "Successfully migrated all users. Will delete deprecated fields..."
      );

      const continueMigration = await ask(`Will delete deprecated fields. Type 'y' to continue? (y/n)`);

      if (continueMigration !== "y") {
        console.log("Migration canceled.");
        return;
      }

      const { status: deleteDepracetedFieldsStatus } = await axios.delete<{
        users: Pick<TUserSchemaV2, keyof IAboutUserFormNewFieldsV1 | "_id">[];
      }>("http://localhost:3000/api/admin/delete-deprecated-fields", {
        headers,
        params: {
          dbType: getUsersResBody.dbType,
        },
      });

      if (deleteDepracetedFieldsStatus !== 200) {
        throw new Error(
          `Failed to delete deprecated fields with status code ${deleteDepracetedFieldsStatus}.`
        );
      }

      console.log(
        "Sleeping for 5000 ms before retrieving all users delete deprecated fields check..."
      );

      await sleep(5000);

      const {
        data: allUsersResBodyAfterPropsDeletion,
        status: allUsersStatusAfterPropsDeletion,
      } = await axios.get<{
        users: Pick<TUserSchemaV2, keyof IAboutUserFormNewFieldsV1 | "_id">[];
      }>("http://localhost:3000/api/admin/get-all-raw-users", {
        headers,
        params: {
          dbType: getUsersResBody.dbType,
        },
      });

      if (allUsersStatusAfterPropsDeletion !== 200) {
        throw new Error(
          `Failed to retrieve all users with status code ${allUsersStatusAfterPropsDeletion}. ${allUsersResBodyAfterPropsDeletion}`
        );
      }

      const usersWithDeprecatedFields: IUserSchema[] = [];

      for (const _user of allUsersResBodyAfterPropsDeletion.users) {
        const user = _user as IUserSchema;
        const didDeleteFields =
          !("gradesOrYears" in user) &&
          !("name" in user) &&
          !("reasonsForSiteVisit" in user) &&
          !("subjects" in user) &&
          !("classroomSize" in user);

        if (!didDeleteFields) {
          usersWithDeprecatedFields.push(user);
        }
      }

      console.log(
        "usersWithDeprecatedFields.length: ",
        usersWithDeprecatedFields.length
      );

      if (failedMigratedUsers.length || usersWithDeprecatedFields.length) {
        const failedMigratedUsersCount = failedMigratedUsers.length;

        console.log(
          `Number of failed migrated users: ${failedMigratedUsersCount}`
        );

        console.log(
          `Number of failed migrated users, usersWithDeprecatedFields: ${usersWithDeprecatedFields.length}`
        );

        if (failedMigratedUsersCount) {
          fs.writeFileSync(
            "failedMigratedUsers.json",
            JSON.stringify(failedMigratedUsers, null, 2)
          );
        }

        if (usersWithDeprecatedFields.length) {
          fs.writeFileSync(
            "usersWithDeprecatedFields.json",
            JSON.stringify(usersWithDeprecatedFields, null, 2)
          );
        }

        throw new Error(
          "Some users failed to be migrated to the new schema. Please check the server logs for more information."
        );
      }

      console.log("Migration had successfully completed.");
      expect(true).toBe(true);
    } catch (error) {
      console.error("An error occurred during the migration process:", error);

      expect(true).toBe(false);
    }
}, 100_000_000);
