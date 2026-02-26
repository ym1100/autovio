import { useAuthenticatedMediaUrl } from "../../hooks/useAuthenticatedMediaUrl";

export function AuthenticatedImg({
  url,
  alt,
  className,
}: {
  url: string | undefined;
  alt: string;
  className?: string;
}) {
  const displayUrl = useAuthenticatedMediaUrl(url);
  if (!displayUrl) return null;
  return <img src={displayUrl} alt={alt} className={className} />;
}

export function AuthenticatedVideo({
  url,
  className,
  controls = true,
}: {
  url: string | undefined;
  className?: string;
  controls?: boolean;
}) {
  const displayUrl = useAuthenticatedMediaUrl(url);
  if (!displayUrl) return null;
  return (
    <video src={displayUrl} className={className} controls={controls} />
  );
}
