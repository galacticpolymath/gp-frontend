/* eslint-disable quotes */

import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
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

const JobToursModal: React.FC<GpPlusModalProps> = ({ _isModalDisplayed }) => {
  const [isModalDisplayed, setIsModalDisplayed] = _isModalDisplayed;
  const { _isGpPlusModalDisplayed } = useModalContext();
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] =
    _isGpPlusModalDisplayed;

  const handleOnClose = () => {
    setIsModalDisplayed(false);
  };

  return (
    <Modal
      show={isModalDisplayed}
      onHide={handleOnClose}
      size="lg"
      centered
      dialogClassName="modal-dialog-override d-flex justify-content-center align-items-center"
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
        width: "100vw",
        // borderRadius: "1rem",
      }}
      contentClassName="w-75 gp-plus-tours-modal"
    >
      <div className="gp-plus-modal-content">
        <p className="gp-plus-modal-description mt-4 mt-sm-0">
          GP+ now includes bulk lesson downloads. Upgrade by August 31th to get
          50% off.
        </p>
        <Link href="/gp-plus" className="gp-plus-modal-learn-more">
          Learn More
        </Link>
        <ul className="d-flex flex-column jusitfy-content-center align-items-center list-unstyled">
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <GrDownload color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span className="text-center">Bulk lesson downloads</span>
              </section>
            </div>
          </li>
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaEdit color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="d-flex justify-content-center align-items-center ps-1"
              >
                <span>Make lessons your own with full editing access.</span>
              </section>
            </div>
          </li>
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaUnlockKeyhole color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span>
                  Unlock full app library with engaging classroom activities
                </span>
              </section>
            </div>
          </li>
          <ListItem Icon={<FaUnlockKeyhole color={ICON_COLOR} />}>
            Access to Unit Bonus Materials
          </ListItem>
        </ul>
        <section className="d-block d-sm-flex justify-content-sm-center align-items-sm-center w-100">
          <GpPlusBtn
            onClick={() => {
              window.location.href = "/gp-plus";
            }}
            disabled={false}
            isLoading={false}
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
