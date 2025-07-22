import { useState } from "react";
import GpPlusModal from "../components/LessonSection/Modals/GpPlusModal";

export const useGpPlusModal = () => {
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] = useState(false);

  return {
    _isGpPlusModalDisplayed: [
      isGpPlusModalDisplayed,
      setIsGpPlusModalDisplayed,
    ],
    GpPlusModal: (
      <GpPlusModal />
    ),
  } as const;
};