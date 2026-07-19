"use client";

import { upload } from "@vercel/blob/client";
import {
  CameraIcon,
  CheckCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import {
  type ChangeEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 25 * 1024 * 1024;

type ReadyScan = {
  scanId: string;
  previewUrl: string;
};

export function ScanImageCapture({
  kind,
  classroomId,
  scanId,
  previewUrl,
  onPreviewUrlChange,
  onScanIdChange,
  onStatusChange,
  onReady,
  onError,
}: {
  kind: "REPORT_CARD" | "GRAND_SHEET";
  classroomId?: string;
  scanId: string | null;
  previewUrl: string | null;
  onPreviewUrlChange: (value: string | null) => void;
  onScanIdChange: (value: string | null) => void;
  onStatusChange: (value: string) => void;
  onReady?: (scan: ReadyScan) => void;
  onError: (message: string) => void;
}) {
  const cameraId = useId();
  const pickerId = useId();
  const objectUrlRef = useRef<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!previewUrl && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [previewUrl]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      onError("Use a JPEG, PNG, or WebP photo. HEIC is not supported yet.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      onError("Choose a photo no larger than 25 MB.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextPreviewUrl;
    onPreviewUrlChange(nextPreviewUrl);
    onScanIdChange(null);
    setProgress(0);
    setIsUploading(true);
    onStatusChange("Preparing secure upload…");

    try {
      const createResponse = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          classroomId: classroomId || undefined,
          originalFilename: file.name,
          contentType: file.type,
          byteSize: file.size,
        }),
      });
      const created = (await createResponse.json()) as {
        scanId?: string;
        pathname?: string;
        error?: string;
      };
      if (!createResponse.ok || !created.scanId || !created.pathname) {
        throw new Error(created.error || "Secure photo storage is unavailable.");
      }

      onStatusChange("Uploading securely…");
      await upload(created.pathname, file, {
        access: "private",
        handleUploadUrl: "/api/scans/upload",
        clientPayload: JSON.stringify({ scanId: created.scanId }),
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
        },
      });

      const confirmResponse = await fetch(
        `/api/scans/${created.scanId}/confirm`,
        { method: "POST" },
      );
      const confirmed = (await confirmResponse.json()) as { error?: string };
      if (!confirmResponse.ok) {
        throw new Error(confirmed.error || "The upload could not be confirmed.");
      }

      onScanIdChange(created.scanId);
      onStatusChange("Saved securely");
      onReady?.({ scanId: created.scanId, previewUrl: nextPreviewUrl });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The secure upload did not complete.";
      onStatusChange("Upload needs attention");
      onError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="soft-action flex min-h-64 items-center justify-center overflow-hidden rounded-[26px] px-4 py-4 text-center">
        {previewUrl ? (
          // Object URLs are local previews; the private stored original is never exposed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Selected scan source"
            className="h-auto max-h-80 w-full rounded-[20px] object-contain"
          />
        ) : (
          <div className="grid max-w-sm gap-2 text-sm text-[color:var(--text-muted)]">
            <PhotoIcon className="mx-auto h-8 w-8" />
            <p className="font-semibold text-[color:var(--text-strong)]">
              Add a clear, well-lit photo
            </p>
            <p>The original will be saved privately before Kradle reads it.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label
          htmlFor={cameraId}
          className="soft-action flex cursor-pointer items-center justify-center rounded-[18px] px-3 py-3 text-sm font-medium"
        >
          <CameraIcon className="mr-2 h-4.5 w-4.5" />
          Take photo
        </label>
        <input
          id={cameraId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          disabled={isUploading}
          onChange={handleFile}
        />

        <label
          htmlFor={pickerId}
          className="soft-action flex cursor-pointer items-center justify-center rounded-[18px] px-3 py-3 text-sm font-medium"
        >
          <PhotoIcon className="mr-2 h-4.5 w-4.5" />
          Photo library
        </label>
        <input
          id={pickerId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isUploading}
          onChange={handleFile}
        />
      </div>

      {isUploading ? (
        <div className="surface-pocket rounded-[18px] px-3 py-3">
          <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)]">
            <span>Uploading securely</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--highlight)]">
            <div
              className="h-full rounded-full bg-[color:var(--accent)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : scanId ? (
        <div className="mood-surface-success flex items-center gap-2 rounded-[18px] px-3 py-3 text-sm font-medium">
          <CheckCircleIcon className="h-5 w-5" />
          Saved securely
        </div>
      ) : null}
    </div>
  );
}
