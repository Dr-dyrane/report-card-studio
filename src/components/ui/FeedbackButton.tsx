"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

import { useFeedback } from "@/components/feedback/FeedbackProvider";

type FeedbackButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  tone?: "neutral" | "success" | "error";
  children: ReactNode;
};

export function FeedbackButton({
  message,
  tone = "neutral",
  onClick,
  children,
  ...props
}: FeedbackButtonProps) {
  const { notify } = useFeedback();

  return (
    <button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          notify(message, tone);
        }
      }}
    >
      {children}
    </button>
  );
}
