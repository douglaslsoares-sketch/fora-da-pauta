"use client";

import { useEffect, useRef, useState } from "react";

type AudioTextInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onTranscribed?: (transcript: string) => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
};

export function AudioTextInput({
  id,
  label,
  value,
  onChange,
  onTranscribed,
  placeholder = "",
  helperText = "Você pode falar ou escrever.",
  rows = 4,
  maxLength = 1000,
}: AudioTextInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [wasTranscribed, setWasTranscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      releaseRecordingResources();
    };
  }, []);

  function releaseRecordingResources() {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    mediaStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  async function transcribeRecordedAudio(blob: Blob) {
    setIsTranscribing(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      const baseType =
        blob.type.split(";")[0] || "audio/webm";

      const extension =
        baseType === "audio/mp4"
          ? "m4a"
          : baseType === "audio/ogg"
            ? "ogg"
            : baseType === "audio/wav" ||
                baseType === "audio/x-wav"
              ? "wav"
              : "webm";

      formData.append(
        "audio",
        blob,
        `audio.${extension}`,
      );

      const response = await fetch(
        "/api/audio/transcrever",
        {
          method: "POST",
          body: formData,
        },
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          typeof (data as Record<string, unknown>).error ===
            "string"
            ? ((data as Record<string, unknown>)
                .error as string)
            : "Não foi possível transcrever o áudio.";

        throw new Error(message);
      }

      if (
        !data ||
        typeof data !== "object" ||
        typeof (data as Record<string, unknown>).text !==
          "string"
      ) {
        throw new Error(
          "A transcrição retornou um formato inválido.",
        );
      }

      const transcript = (
        data as Record<string, unknown>
      ).text as string;

      onChange(transcript);
      onTranscribed?.(transcript);
      setWasTranscribed(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível transcrever o áudio.",
      );
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    if (isRecording || isTranscribing) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setErrorMessage(
        "Este navegador não oferece gravação de áudio compatível.",
      );
      return;
    }

    try {
      setErrorMessage("");
      setWasTranscribed(false);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      mediaStreamRef.current = stream;

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];

      const mimeType = preferredTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        },
      );

      recorder.addEventListener(
        "stop",
        () => {
          const chunks = [
            ...audioChunksRef.current,
          ];

          audioChunksRef.current = [];

          const recordedType =
            recorder.mimeType ||
            chunks[0]?.type ||
            "audio/webm";

          const blob = new Blob(chunks, {
            type: recordedType,
          });

          releaseRecordingResources();
          setIsRecording(false);

          if (blob.size === 0) {
            setErrorMessage(
              "Não foi possível captar o áudio. Tente novamente.",
            );
            return;
          }

          void transcribeRecordedAudio(blob);
        },
        { once: true },
      );

      recorder.addEventListener(
        "error",
        () => {
          releaseRecordingResources();
          setIsRecording(false);

          setErrorMessage(
            "A gravação foi interrompida. Tente novamente.",
          );
        },
        { once: true },
      );

      recorder.start();
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(
        () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        },
        60000,
      );
    } catch {
      releaseRecordingResources();
      setIsRecording(false);

      setErrorMessage(
        "Não foi possível acessar o microfone. Verifique a permissão do navegador.",
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }
  }

  return (
    <div>
      <textarea
        aria-label={label}
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setWasTranscribed(false);
        }}
        disabled={isRecording || isTranscribing}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full resize-y border border-black/15 bg-[#f8f8f5] px-4 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/30 focus:border-black disabled:opacity-60"
      />

      <div className="mt-2 flex items-center justify-between gap-4 text-xs text-black/35">
        <span>{helperText}</span>
        <span>
          {value.length}/{maxLength}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (isRecording) {
              stopRecording();
              return;
            }

            void startRecording();
          }}
          disabled={isTranscribing}
          className="inline-flex min-h-11 items-center justify-center border border-black/15 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRecording
            ? "Parar gravação"
            : isTranscribing
              ? "Transcrevendo..."
              : "Falar"}
        </button>

        <span
          className="text-sm leading-6 text-black/50"
          aria-live="polite"
        >
          {isRecording
            ? "Gravando... fale normalmente."
            : isTranscribing
              ? "Convertendo áudio em texto..."
              : wasTranscribed
                ? "Áudio transcrito. Confira o texto antes de continuar."
                : "Se preferir, use o microfone."}
        </span>
      </div>

      {errorMessage ? (
        <p
          className="mt-4 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/65"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}