/* eslint-disable quotes */

import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import Image from "next/image";
import Wave from "react-wavify";
import { GrDownload } from "react-icons/gr";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import Link from "next/link";
import { useModalContext } from "../../../providers/ModalProvider";
import useSiteSession from "../../../customHooks/useSiteSession";
import { TUseStateReturnVal } from "../../../types/global";
import { GpPlusBtn } from "../../../pages/gp-plus";

interface GpPlusModalProps {
  onClose?: () => void;
  userStatus?: ReturnType<typeof useSiteSession>["status"];
  _isModalDisplayed: TUseStateReturnVal<boolean>;
  url: string;
}

const ICON_COLOR = "#14B1EA";

interface IGpPlusAttribute {
  children: React.ReactNode;
  Icon: React.ReactNode;
}

const ListItem: React.FC<IGpPlusAttribute> = ({ children, Icon }) => {
  return (
    <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
      <div className="w-75 justify-content-center align-items-center d-flex">
        <section className="d-flex justify-content-center align-items-center">
          {Icon}
        </section>
        <section
          style={{ paddingTop: ".2em" }}
          className="d-flex justify-content-center align-items-center ps-1"
        >
          <span>{children}</span>
        </section>
      </div>
    </li>
  );
};

const JobToursModal: React.FC<GpPlusModalProps> = ({
  _isModalDisplayed,
  url,
}) => {
  const [isModalDisplayed, setIsModalDisplayed] = _isModalDisplayed;
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  const handleOnClose = () => {
    setIsModalDisplayed(false);
    setIsDoneLoading(false);
  };

  return (
    <Modal
      show={isModalDisplayed}
      onShow={() => {
        if (!isDoneLoading) {
          setTimeout(() => {
            setIsDoneLoading(true);
          }, process.env.NEXT_PUBLIC_HOST === 'localhost' ? 3100 : 1_200);
        }
      }}
      onHide={handleOnClose}
      size="lg"
      centered
      dialogClassName="modal-dialog-override d-flex justify-content-center align-items-center"
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
        width: "100vw",
      }}
      contentClassName="w-75 gp-plus-tours-modal"
    >
      <div className="gp-plus-modal-content h-100">
        <div style={{ height: "90%" }} className="position-relative">
          <div
            className={`position-absolute bg-white w-100 h-100 rounded d-flex justify-content-center align-items-center ${
              isDoneLoading ? "d-none" : "d-block"
            }`}
          >
            <div className="position-relative bg-white w-100 h-100 rounded d-flex justify-content-center align-items-center">
              <div
                style={{ zIndex: 1000000 }}
                className="d-flex justify-content-center align-items-center"
              >
                <Spinner animation="border" variant="primary" color="black" />
                <span className="ms-2 text-black">Loading, please wait...</span>
              </div>
              <div
                style={{ filter: "blur(5px)" }}
                className="w-100 h-100 position-absolute shadow-lg"
              />
            </div>
          </div>
          <iframe
            src={url}
            className={`w-100 rounded ${
              isDoneLoading ? "opacity-100" : "opacity-0"
            }`}
            style={{ height: "100%", pointerEvents: "none", transition: "all" }}
          />
        </div>
        <section className="mt-2 d-block d-sm-flex justify-content-sm-center align-items-sm-center w-100">
          <GpPlusBtn
            onClick={() => {
              window.location.href = "/gp-plus";
            }}
            disabled={false}
            isLoading={false}
            className="px-sm-3 py-sm-2 col-10 col-sm-12 bg-white"
          >
            <span className="text-black">
              Subscribe to create customizable <q>Job Tours</q>
            </span>
          </GpPlusBtn>
        </section>
      </div>
    </Modal>
  );
};

export default JobToursModal;
