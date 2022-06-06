import { blackColor, hexToRgb } from "../../../assets/material-kit-pro-react";

const cardAvatarStyle = {
  cardAvatar: {
    "&$cardAvatarProfile img, &$cardAvatarProfileSq img, &$cardAvatarTestimonial img": {
      width: "100%",
      height: "auto"
    }
  },
  cardAvatarProfile: {
    maxWidth: "130px",
    maxHeight: "130px",
    margin: "-50px auto 0",
    borderRadius: "50%",
    overflow: "hidden",
    padding: "0",
    boxShadow:
      "0 16px 38px -12px rgba(" +
      hexToRgb(blackColor) +
      ", 0.56), 0 4px 25px 0px rgba(" +
      hexToRgb(blackColor) +
      ", 0.12), 0 8px 10px -5px rgba(" +
      hexToRgb(blackColor) +
      ", 0.2)",
    "&$cardAvatarPlain": {
      marginTop: "0"
    }
  },

  //custom fork of cardAvatarProfile
  cardAvatarProfileSq: {
    maxWidth: "80%", /*"130px",*/
    maxHeight: "130px",
    height: "10rem",
    width: "auto",
    margin: "auto",
    borderRadius: "5%",
    display: "flex",
    alignContents: "middle",

    // overflow: "hidden",
    objectFit: "contain",
    padding: "auto",
    boxShadow:
      "0 16px 38px -12px rgba(" +
      hexToRgb(blackColor) +
      ", 0.56), 0 4px 25px 0px rgba(" +
      hexToRgb(blackColor) +
      ", 0.12), 0 8px 10px -5px rgba(" +
      hexToRgb(blackColor) +
      ", 0.2)",
    "&$cardAvatarPlain": {
      marginTop: "0"
    },
    "& a": {
      display: "flex",
      alignContents: "middle",
      margin: "auto"
    },
    "& img": {
      maxWidth: "130px",
      maxHeight: "130px"
    },
    // Hover effects
    "&:hover": {
      // border: "4px solid red",
      boxShadow:
        "0 16px 38px -6px rgba(" +
        hexToRgb(blackColor) +
        ", 0.56), 0 4px 28px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.12), 0 8px 12px -2px rgba(" +
        hexToRgb(blackColor) +
        ", 0.2)"
    }

  },

  cardAvatarPlain: {},
  cardAvatarTestimonial: {
    margin: "-50px auto 0",
    maxWidth: "100px",
    maxHeight: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    padding: "0",
    boxShadow:
      "0 16px 38px -12px rgba(" +
      hexToRgb(blackColor) +
      ", 0.56), 0 4px 25px 0px rgba(" +
      hexToRgb(blackColor) +
      ", 0.12), 0 8px 10px -5px rgba(" +
      hexToRgb(blackColor) +
      ", 0.2)",
    "&$cardAvatarPlain": {
      marginTop: "0"
    }
  },
  cardAvatarTestimonialFooter: {
    marginBottom: "-50px",
    marginTop: "10px"
  }
};

export default cardAvatarStyle;
