export function getAvatarSeed(input: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  return (
    input.username?.trim() ||
    input.name?.trim() ||
    input.email?.trim() ||
    "kradle"
  );
}

export function getGeneratedAvatarUrl(input: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  const seed = encodeURIComponent(getAvatarSeed(input));
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}&backgroundColor=b6c7ff,d9c3ff,f4d6bf`;
}

export function resolveAvatarUrl(input: {
  image?: string | null;
  name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  return input.image?.trim() || getGeneratedAvatarUrl(input);
}

export function getAvatarInitial(input: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
}) {
  return (getAvatarSeed(input).slice(0, 1) || "K").toUpperCase();
}
