 

import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongodb } from "../../backend/utils/connection";
import { CustomError } from "../../backend/utils/errors";
import { INewUnitSchema } from "../../backend/models/Unit/types/unit";
import { insertUnit } from "../../backend/services/unitServices";

const getFirstLessonForDebug = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const sections = root.Sections as Record<string, unknown> | undefined;
  const teachingMaterials = sections?.teachingMaterials as
    | Record<string, unknown>
    | undefined;
  const classroom = teachingMaterials?.classroom as Record<string, unknown> | undefined;
  const resources = classroom?.resources as unknown[] | undefined;
  const firstResource =
    Array.isArray(resources) && resources.length > 0
      ? (resources[0] as Record<string, unknown>)
      : null;
  const lessons = firstResource?.lessons as unknown[] | undefined;
  const firstLesson =
    Array.isArray(lessons) && lessons.length > 0
      ? (lessons[0] as Record<string, unknown>)
      : null;

  if (!firstLesson || typeof firstLesson !== "object") {
    return null;
  }

  return {
    keys: Object.keys(firstLesson),
    has_lsnPrep: Object.prototype.hasOwnProperty.call(firstLesson, "lsnPrep"),
    lsnPrep: firstLesson.lsnPrep ?? null,
    has_prep: Object.prototype.hasOwnProperty.call(firstLesson, "prep"),
    prep: firstLesson.prep ?? null,
    has_lsnDur: Object.prototype.hasOwnProperty.call(firstLesson, "lsnDur"),
    has_lsnPreface: Object.prototype.hasOwnProperty.call(firstLesson, "lsnPreface"),
    has_learningObj: Object.prototype.hasOwnProperty.call(firstLesson, "learningObj"),
    has_chunks: Object.prototype.hasOwnProperty.call(firstLesson, "chunks"),
  };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (
      !request?.body?.unit ||
      (request?.body?.unit &&
        typeof request?.body?.unit === "object" &&
        !Object.keys(request?.body?.unit)?.length) ||
      typeof request?.body?.unit !== "object"
    ) {
      console.error(
        "Invalid request: The `request.body.unit` is either empty or not of the correct data type."
      );

      return response.status(400).json({
        msg: "The `request.body.unit` is empty or the wrong data type.",
      });
    }

    const newUnit: INewUnitSchema = request?.body?.unit;
    const firstLessonDebug = getFirstLessonForDebug(newUnit);
    console.log(
      "[insert-unit] payload lesson debug:",
      JSON.stringify(
        {
          unitId: newUnit?._id ?? null,
          numID: newUnit?.numID ?? null,
          locale: newUnit?.locale ?? null,
          firstLessonDebug,
          topLevelKeys:
            newUnit && typeof newUnit === "object"
              ? Object.keys(newUnit as Record<string, unknown>)
              : [],
        },
        null,
        2
      )
    );
    const { wasSuccessful } = 
      await connectToMongodb(15_000, 0, true, request.body.dbType);

    if (!wasSuccessful) {
      throw new CustomError("Failed to connect to the database.", 500);
    }

    const { status, msg } = await insertUnit(newUnit);

    if (status !== 200) {
      throw new CustomError(msg, status);
    }

    return response.status(status).json({ msg: msg });
  } catch (error: unknown) {
    const { code, message } = error as { code: number; message: string };

    return response
      .status(code ?? 500)
      .json({ msg: message ?? "Failed to insert lesson into the db." });
  }
}
