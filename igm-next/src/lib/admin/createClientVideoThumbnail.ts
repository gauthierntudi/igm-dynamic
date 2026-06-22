/** Vignette client (1 s) pour prévisualiser une vidéo avant enregistrement serveur. */
export function createClientVideoThumbnail(file: File, seekSeconds = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(seekSeconds, Math.max(0, video.duration - 0.1));
      } catch {
        cleanup();
        reject(new Error("Impossible de lire la vidéo"));
      }
    };

    video.onseeked = () => {
      try {
        const maxDimension = 280;
        const aspectRatio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;
        let drawWidth: number;
        let drawHeight: number;

        if (aspectRatio > 1) {
          drawWidth = maxDimension;
          drawHeight = maxDimension / aspectRatio;
        } else {
          drawWidth = maxDimension * aspectRatio;
          drawHeight = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = drawWidth;
        canvas.height = drawHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas indisponible"));
          return;
        }

        ctx.drawImage(video, 0, 0, drawWidth, drawHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Lecture vidéo impossible"));
    };
  });
}
