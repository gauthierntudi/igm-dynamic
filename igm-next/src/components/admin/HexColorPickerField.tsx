"use client";

import { FieldLabel, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useCallback, useId, useMemo } from "react";

import {
  TIMELINE_BLUE_PALETTE,
  TIMELINE_GOLD,
  normalizeHexColor,
} from "@/lib/cms/who-we-are/timelineColors";

import "./hex-color-picker-field.css";

const DEFAULT_PRESETS = [...TIMELINE_BLUE_PALETTE, TIMELINE_GOLD] as const;

function pickerValue(value: string | undefined): string {
  return normalizeHexColor(value) ?? "#1b4491";
}

export const HexColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const inputId = useId();
  const { value, setValue, showError } = useField<string>({ path });
  const presets = useMemo(() => {
    const custom = field.admin?.custom;
    if (custom && typeof custom === "object" && "presets" in custom) {
      const list = (custom as { presets?: unknown }).presets;
      if (Array.isArray(list) && list.every((item) => typeof item === "string")) {
        return list as string[];
      }
    }
    return [...DEFAULT_PRESETS];
  }, [field.admin?.custom]);

  const normalized = normalizeHexColor(value);
  const isEmpty = !normalized;

  const updateValue = useCallback(
    (next: string) => {
      const hex = normalizeHexColor(next);
      setValue(hex ?? "");
    },
    [setValue],
  );

  const clearValue = useCallback(() => setValue(""), [setValue]);

  return (
    <div className={`field-type hex-color-picker-field${showError ? " hex-color-picker-field--error" : ""}`}>
      <FieldLabel htmlFor={inputId} label={field.label} required={field.required} />

      <div className="hex-color-picker-field__row">
        <input
          id={inputId}
          type="color"
          className="hex-color-picker-field__native"
          value={pickerValue(value)}
          onChange={(event) => updateValue(event.target.value)}
          aria-label={typeof field.label === "string" ? field.label : "Couleur"}
        />

        <input
          type="text"
          className="hex-color-picker-field__hex"
          value={value ?? ""}
          onChange={(event) => updateValue(event.target.value)}
          placeholder="#1b4491"
          spellCheck={false}
          autoComplete="off"
        />

        {!field.required ? (
          <button
            type="button"
            className="hex-color-picker-field__clear"
            onClick={clearValue}
            disabled={isEmpty}
          >
            Auto
          </button>
        ) : null}
      </div>

      <div className="hex-color-picker-field__presets" role="list" aria-label="Couleurs charte">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            role="listitem"
            className={`hex-color-picker-field__swatch${
              normalized === normalizeHexColor(preset) ? " hex-color-picker-field__swatch--active" : ""
            }`}
            style={{ backgroundColor: preset }}
            onClick={() => updateValue(preset)}
            title={preset}
            aria-label={preset}
          />
        ))}
      </div>

      {isEmpty ? (
        <p className="hex-color-picker-field__hint">Aucune couleur — repli automatique sur la charte.</p>
      ) : (
        <p className="hex-color-picker-field__hint" aria-live="polite">
          Couleur active : {normalized}
        </p>
      )}
    </div>
  );
};
