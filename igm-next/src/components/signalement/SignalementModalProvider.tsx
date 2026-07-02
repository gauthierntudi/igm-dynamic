"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import {
  loadSignalementModalOpen,
  saveSignalementModalOpen,
} from "@/lib/signalement/signalementFormDraft";

import modalStyles from "./signalementModal.module.css";

import SignalementForm from "@/components/signalement/SignalementForm";

type SignalementModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const SignalementModalContext =
  createContext<SignalementModalContextValue | null>(null);

export function useSignalementModal() {
  const ctx = useContext(SignalementModalContext);
  if (!ctx) {
    throw new Error("useSignalementModal doit être utilisé dans SignalementModalProvider");
  }
  return ctx;
}

function SignalementModalPortal() {
  const { isOpen, close } = useSignalementModal();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || formSubmitting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, formSubmitting]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={modalStyles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (formSubmitting) return;
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={modalStyles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-igm-modal="signalement"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={modalStyles.close}
          aria-label="Fermer le formulaire de signalement"
          disabled={formSubmitting}
          onClick={close}
        >
          ×
        </button>
        <div className={modalStyles.dialogInner}>
          <h2 id={titleId} className={modalStyles.title}>
            Formulaire de signalement
          </h2>
          <p className={modalStyles.subtitle}>
            Transmettez des informations sur des infractions ou pratiques irrégulières dans le
            secteur minier. Les champs marqués d’une astérisque sont obligatoires.
          </p>
          <SignalementForm onSuccess={close} onSubmittingChange={setFormSubmitting} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SignalementModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (loadSignalementModalOpen()) {
      setIsOpen(true);
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    saveSignalementModalOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    saveSignalementModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      isOpen,
    }),
    [open, close, isOpen],
  );

  return (
    <SignalementModalContext.Provider value={value}>
      {children}
      <SignalementModalPortal />
    </SignalementModalContext.Provider>
  );
}
