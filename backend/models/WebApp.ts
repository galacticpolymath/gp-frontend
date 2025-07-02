import { Model, Schema, models, model } from "mongoose";
import { IWebAppLink } from "../../types/global";

export type TDbWebAppProps = {
  aboutWebAppLink?: string | null;
  aboutWebAppLinkType: "blog" | "unit";
};
export type TWebAppForUI = {
  unitTitle?: string | null;
  webAppPreviewImg?: string | null;
  webAppImgAlt?: string | null;
} & TDbWebApp;
export type TDbWebApp = Pick<
  IWebAppLink,
  | "description"
  | "lessonIdStr"
  | "pathToFile"
  | "title"
  | "unitNumID"
  | "webAppLink"
> &
  TDbWebAppProps;
let webApp = models.webApps as Model<TDbWebApp, {}, {}, {}, any, any>;

if (!webApp) {
  const WebAppSchema = new Schema<TDbWebApp>({
    lessonIdStr: String,
    unitNumID: { type: Number, ref: "Unit", default: null },
    webAppLink: String,
    title: String,
    pathToFile: String,
    aboutWebAppLink: String,
    aboutWebAppLinkType: String,
    description: String,
  });

  webApp = model("webApps", WebAppSchema);
}

export default webApp;
