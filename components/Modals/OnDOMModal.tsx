import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { is } from "cypress/types/bluebird";

import React, { Fragment } from "react";

interface OnDOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  isTitleShown?: boolean;
  isSubtitleShown?: boolean;
  children?: React.ReactNode;
}

const OnDOMModal: React.FC<OnDOMModalProps> = ({
  isOpen,
  onClose,
  className,
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  isTitleShown = true,
  isSubtitleShown = true,
  children,
}) => {
  return (
    <Transition appear={true} show={true} as={Fragment} transition>
      <Dialog as="div" className="position-relative" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            id="success-modal-close-btn"
            className={`position-fixed top-0 start-0 w-100 h-100 bg-dark ${"opacity-100"}`}
            onClick={onClose}
          />
        </TransitionChild>
        <div
          className={`position-fixed top-0 start-0 w-100 h-100 overflow-y-auto ${"opacity-100"}`}
        >
          <div className="d-flex min-vh-100 align-items-center justify-content-center py-4 px-2 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={className}>
                {isTitleShown && (
                  <DialogTitle as="h3" className={titleClassName}>
                    {title}
                  </DialogTitle>
                )}
                {isSubtitleShown && (
                  <DialogTitle as="h6" className={subtitleClassName}>
                    {subtitle}
                  </DialogTitle>
                )}
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OnDOMModal;
