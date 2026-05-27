type Props = {
  size?: number;
  className?: string;
};

const VERIFIED_BADGE_IMAGE_URL =
  "/app/assets/icons/badge-check.svg";

export function VerifiedBadgeImage({ size = 18, className = "" }: Props) {
  return (
    <img
      src={VERIFIED_BADGE_IMAGE_URL}
      alt="Verified"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      loading="lazy"
    />
  );
}

