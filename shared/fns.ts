
// front-end related
export const checkIfElementClickedWasClipboard = (
    parentElement: unknown
  ): boolean => {
    if (
      parentElement &&
      typeof parentElement === "object" &&
      "nodeName" in parentElement &&
      typeof parentElement.nodeName === "string" &&
      parentElement?.nodeName?.toLowerCase() === "body"
    ) {
      console.log("Clip board icon wasn't clicked...");
      return false;
    }

    if (
      parentElement &&
      typeof parentElement === "object" &&
      "id" in parentElement &&
      parentElement.id === "clipboardIconWrapper"
    ) {
      console.log("clip board icon was clicked...");
      return true;
    }

    return checkIfElementClickedWasClipboard(
      (parentElement as { parentElement: unknown }).parentElement
    );
  };