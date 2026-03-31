"use client";

import { useMemo, useState } from "react";

import { getAvatarInitial, resolveAvatarUrl } from "@/lib/avatar";

type UserAvatarProps = {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  sizeClassName?: string;
  textClassName?: string;
  roundedClassName?: string;
  className?: string;
};

export function UserAvatar({
  name,
  username,
  email,
  image,
  sizeClassName = "h-10 w-10",
  textClassName = "text-sm",
  roundedClassName = "rounded-full",
  className = "",
}: UserAvatarProps) {
  const src = useMemo(
    () => resolveAvatarUrl({ image, name, username, email }),
    [email, image, name, username],
  );
  const initial = useMemo(
    () => getAvatarInitial({ name, username, email }),
    [email, name, username],
  );
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = failedSrc !== src;

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] ${sizeClassName} ${roundedClassName} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? username ?? email ?? "Profile avatar"}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className={`font-semibold ${textClassName}`}>{initial}</span>
      )}
    </span>
  );
}
