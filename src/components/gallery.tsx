"use client";

import { X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import type { StoreImageDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  storeName,
}: {
  images: StoreImageDTO[];
  storeName: string;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  const close = React.useCallback(() => setOpenIndex(null), []);

  const step = React.useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length]
  );

  React.useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, step]);

  if (!images.length) return null;

  const [hero, ...rest] = images;

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative col-span-2 aspect-4/3 overflow-hidden rounded-card bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Image
            src={hero.url}
            alt={hero.alt}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="sr-only">Open gallery for {storeName}</span>
        </button>

        <div className="grid gap-2 sm:grid-rows-2">
          {rest.slice(0, 2).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenIndex(i + 1)}
              className={cn(
                "group relative aspect-4/3 overflow-hidden rounded-card bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:aspect-auto"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {i === 1 && images.length > 3 ? (
                <span className="absolute inset-0 grid place-items-center bg-ink-950/55 text-sm font-medium text-white">
                  +{images.length - 3} more
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => {
          // Backdrop click — the dialog element itself is the backdrop area.
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto max-h-[92vh] w-[min(92vw,64rem)] rounded-card bg-ink-950 p-0 backdrop:bg-ink-950/80"
      >
        {openIndex !== null ? (
          <div className="relative">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={images[openIndex].url}
                alt={images[openIndex].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-3 text-white">
              <p className="text-sm">
                {images[openIndex].caption ?? images[openIndex].alt}
                <span className="ml-2 text-white/55">
                  {openIndex + 1} / {images.length}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-full px-3 py-1 text-sm hover:bg-ground/10"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-full px-3 py-1 text-sm hover:bg-ground/10"
                >
                  Next
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink-950/70 text-white hover:bg-ink-950"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
