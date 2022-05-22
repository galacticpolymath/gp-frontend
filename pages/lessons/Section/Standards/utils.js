export const formatAlignmentNotes = (text) => {
  return text.replace(/•/g, "-").replace(/\^2/g, "²");
};
