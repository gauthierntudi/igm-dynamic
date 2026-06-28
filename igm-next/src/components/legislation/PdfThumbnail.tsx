"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { FileText } from "lucide-react";

import styles from "./pdf-thumbnail.module.css";

type Props = {
  url: string;
  title: string;
};

type CanvasProps = { url: string };

export function PdfThumbnail({ url, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [Canvas, setCanvas] = useState<ComponentType<CanvasProps> | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    void import("./PdfThumbnailCanvas").then((mod) => setCanvas(() => mod.PdfThumbnailCanvas));
  }, [visible]);

  return (
    <div ref={ref} className={styles.wrap} aria-hidden>
      {Canvas && visible ? (
        <Canvas url={url} />
      ) : (
        <div className={styles.placeholder}>
          <FileText size={28} strokeWidth={1.5} />
        </div>
      )}
      <span className={styles.srOnly}>{title}</span>
    </div>
  );
}
