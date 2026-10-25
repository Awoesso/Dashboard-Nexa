import {
  FileText,
  Upload,
  X,
} from "lucide-react";

import type { RefObject } from "react";

interface Props {
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  error?: string;
  onChange: (file: File | null) => void;
  loading?: boolean;
}

const DigitalFileUpload = ({
  file,
  inputRef,
  error,
  onChange,
  loading = false,
}: Props) => {
  /* =========================================================
     SKELETON
  ========================================================= */

  if (loading) {
    return (
      <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! sm:p-5!">
        <div className="animate-pulse!">
          {/* Header */}

          <div className="flex! items-center! gap-2.5!">
            <div className="skeleton h-7! w-7! shrink-0! rounded-full!" />

            <div className="min-w-0! flex-1!">
              <div className="skeleton h-3.5! w-24! rounded-md!" />

              <div className="skeleton mt-1.5! h-2.5! w-36! max-w-full! rounded-md!" />
            </div>
          </div>

          {/* Upload area */}

          <div className="skeleton mt-4! h-28! w-full! rounded-2xl!" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full! min-w-0! rounded-2xl! border! border-gray-200! bg-white! p-4! shadow-sm! transition-all! duration-200! sm:p-5!">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex! items-center! gap-2.5!">
        <div className="flex! h-7! w-7! shrink-0! items-center! justify-center! rounded-full! bg-gray-900! text-white!">
          <FileText
            size={13}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0!">
          <h2 className="font-heading! text-[14px]! font-semibold! tracking-tight! text-gray-900! sm:text-[15px]!">
            Fichier numérique
          </h2>

          <p className="mt-0.5! truncate! text-[10px]! font-medium! text-gray-500! sm:text-[11px]!">
            Fichier remis au client après l’achat.
          </p>
        </div>
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => {
          onChange(
            event.target.files?.[0] ?? null,
          );

          event.target.value = "";
        }}
      />

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`
            group!
            mt-4!
            flex!
            min-h-28!
            w-full!
            cursor-pointer!
            flex-col!
            items-center!
            justify-center!
            gap-1.5!
            rounded-2xl!
            border!
            border-dashed!
            bg-[#fafafa]!
            px-4!
            py-5!
            text-center!
            transition-all!
            duration-200!
            hover:bg-blue-50/30!
            active:scale-[0.995]!
            ${
              error
                ? "border-red-300! hover:border-red-400!"
                : "border-gray-200! hover:border-blue-400!"
            }
          `}
        >
          {/* Icon */}

          <div
            className="
              flex!
              h-9!
              w-9!
              items-center!
              justify-center!
              rounded-xl!
              border!
              border-gray-200!
              bg-white!
              text-gray-400!
              shadow-sm!
              transition-all!
              duration-200!
              group-hover:border-blue-200!
              group-hover:text-blue-600!
            "
          >
            <Upload
              size={16}
              strokeWidth={1.9}
            />
          </div>

          {/* Primary text */}

          <span className="mt-0.5! text-[11px]! font-semibold! text-gray-700! transition-colors! group-hover:text-blue-600!">
            Choose file
          </span>

          {/* Secondary text */}

          <span className="text-[9px]! font-medium! text-gray-400!">
            PDF, ZIP, PNG, JPG, etc.
          </span>
        </button>
      ) : (
        /* ===================================================
           FILE SELECTED
        =================================================== */

        <div className="mt-4! flex! min-w-0! items-center! justify-between! gap-3! rounded-2xl! border! border-gray-200! bg-[#fafafa]! p-3! transition-all! duration-200!">
          {/* File info */}

          <div className="flex! min-w-0! flex-1! items-center! gap-3!">
            <div className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-xl! border! border-gray-200! bg-white! text-blue-600! shadow-sm!">
              <FileText
                size={16}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0! flex-1!">
              <p className="truncate! text-[11px]! font-semibold! text-gray-900! sm:text-xs!">
                {file.name}
              </p>

              <p className="mt-0.5! text-[9px]! font-medium! text-gray-400! sm:text-[10px]!">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          {/* Remove */}

          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer le fichier"
            className="
              flex!
              h-8!
              w-8!
              shrink-0!
              items-center!
              justify-center!
              rounded-xl!
              text-gray-400!
              transition-all!
              duration-150!
              hover:bg-red-50!
              hover:text-red-500!
              active:scale-90!
            "
          >
            <X
              size={14}
              strokeWidth={1.9}
            />
          </button>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <p className="mt-2! text-[10px]! font-semibold! leading-relaxed! text-red-500!">
          {error}
        </p>
      )}
    </section>
  );
};

/* =========================================================
   FILE SIZE
========================================================= */

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default DigitalFileUpload;