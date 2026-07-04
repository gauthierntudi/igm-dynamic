"use client";

import { useCallback, useId, useRef, useState } from "react";
import { toast } from "react-toastify";

import { PrimaryBtn4Content } from "@/components/home/banner/PrimaryBtn4Content";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/TurnstileWidget";
import type { SupportedLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { withDeployedBase } from "@/lib/deployBasePath";
import { TURNSTILE_FORM_FIELD } from "@/lib/security/turnstile";
import { isTurnstileClientEnabled, turnstileSiteKey } from "@/lib/security/turnstileConfig";

import styles from "./contact-form.module.css";

type Props = {
  locale: SupportedLocale;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm({ locale }: Props) {
  const baseId = useId();
  const t = getMessages(locale).contactPage.form;
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = isTurnstileClientEnabled();
  const turnstileSiteKeyValue = turnstileSiteKey();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  function fieldId(key: keyof FormState): string {
    return `${baseId}-${key}`;
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (turnstileEnabled && !turnstileToken) {
      toast.error(t.captchaRequired);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(withDeployedBase("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          locale,
          _gotcha: "",
          ...(turnstileToken ? { [TURNSTILE_FORM_FIELD]: turnstileToken } : {}),
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };

      if (!response.ok || !data.ok) {
        toast.error(data.error || t.errorGeneric);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      toast.success(data.message || t.success);
      setForm(INITIAL);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch {
      toast.error(t.errorGeneric);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <input
            id={fieldId("name")}
            type="text"
            name="name"
            autoComplete="name"
            required
            placeholder=" "
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          <label htmlFor={fieldId("name")}>{t.name}</label>
        </div>

        <div className={styles.field}>
          <input
            id={fieldId("email")}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder=" "
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <label htmlFor={fieldId("email")}>{t.email}</label>
        </div>

        <div className={styles.field}>
          <input
            id={fieldId("phone")}
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder=" "
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <label htmlFor={fieldId("phone")}>{t.phone}</label>
        </div>

        <div className={styles.field}>
          <input
            id={fieldId("subject")}
            type="text"
            name="subject"
            required
            placeholder=" "
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
          />
          <label htmlFor={fieldId("subject")}>{t.subject}</label>
        </div>
      </div>

      <div className={`${styles.field} ${styles.fieldTextarea}`}>
        <textarea
          id={fieldId("message")}
          name="message"
          required
          rows={6}
          placeholder=" "
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
        <label htmlFor={fieldId("message")}>{t.message}</label>
      </div>

      <input type="hidden" name="_gotcha" value="" tabIndex={-1} autoComplete="off" aria-hidden />

      {turnstileEnabled && turnstileSiteKeyValue ? (
        <div className={styles.turnstileWrap}>
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={turnstileSiteKeyValue}
            onToken={setTurnstileToken}
            onExpire={handleTurnstileExpire}
            onError={handleTurnstileError}
            theme="auto"
          />
        </div>
      ) : null}

      <button
        type="submit"
        className="primary-btn4"
        disabled={submitting || (turnstileEnabled && !turnstileToken)}
      >
        <PrimaryBtn4Content label={submitting ? t.submitting : t.submit} />
      </button>
    </form>
  );
}
