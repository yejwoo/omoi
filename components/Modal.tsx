// components/Modal.tsx
import React, { ReactNode, useRef, useEffect } from "react";
import useClickOutside from "@/app/hooks/useClickOutside";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, () => {
    if (isOpen) onClose();
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
      <Image
        className="flex p-1 items-end cursor-pointer absolute right-4 top-4 z-10"
        src="/icons/close.svg"
        width={40}
        height={40}
        alt="close"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="bg-white md:rounded-md p-4 w-full h-full md:h-5/6 max-w-5xl relative overflow-hidden"
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
