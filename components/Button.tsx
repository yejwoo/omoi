"use client";

import { useFormStatus } from "react-dom";
interface ButtonProps {
  content: string;
  type: "primary" | "secondary";
  onClick?: () => void;
  isSubmitting: boolean;
}

const Button: React.FC<ButtonProps> = ({ content, type, onClick, isSubmitting=false}) => {
  const { pending } = useFormStatus();
  const buttonType =
    type === "primary"
      ? "border-transparent text-white bg-brand-100 transition duration-300 ease-in-out transform hover:bg-brand-200"
      : "text-gray-500";
  return (
    <button
      type="submit"
      className={`w-full py-2 px-4 border rounded-md text-sm font-medium ${buttonType} disabled:bg-brand-50`}
      disabled={isSubmitting || pending}
      onClick={onClick}
    >
      {isSubmitting || pending ? "로딩 중" : content}
    </button>
  );
};

export default Button;
