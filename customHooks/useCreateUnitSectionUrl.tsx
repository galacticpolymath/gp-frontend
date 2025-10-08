import { useRouter } from "next/router";
import { UNITS_URL_PATH } from "../shared/constants";
import { getH2Id } from "../components/CollapsibleLessonSection";
import { setLocalStorageItem } from "../shared/fns";

export const useCreateUnitSectionUrl = () => {
  const router = useRouter();

  const createUnitSectionUrl = (sectionTitle?: string) => {
    if (!sectionTitle) {
      return `${window.location.origin}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}`;
    }

    setLocalStorageItem("lessonIdToViewAfterRedirect", getH2Id(sectionTitle));

    return `${window.location.origin}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}`;
  };

  return { createUnitSectionUrl };
};
