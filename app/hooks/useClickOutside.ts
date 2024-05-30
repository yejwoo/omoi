import { useEffect, RefObject } from "react";

export default function useClickOutside(
  ref: RefObject<HTMLElement>,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setShowModal]);
}
