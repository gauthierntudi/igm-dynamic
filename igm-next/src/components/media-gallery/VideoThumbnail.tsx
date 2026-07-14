type Props = {
  posterSrc: string;
  alt: string;
};

export function VideoThumbnail({ posterSrc, alt }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={posterSrc} alt={alt} loading="lazy" />
  );
}
