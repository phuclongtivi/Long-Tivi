"use client";

export function isArtistRank(rank?: string) {
  const r = (rank || "").toLowerCase();
  return r === "artist" || r === "nghe-sy" || r === "nghệ sỹ" || r === "nghe sy";
}

export function UserAvatarFrame({
  src,
  rank,
  size = 36,
  alt = "",
}: {
  src?: string | null;
  rank?: string;
  size?: number;
  alt?: string;
}) {
  const artist = isArtistRank(rank);
  const inner = Math.max(12, size - 10);
  return (
    <span
      className={artist ? "pl-avatar-3d pl-avatar-artist" : "pl-avatar-3d"}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        verticalAlign: "middle",
        lineHeight: 0,
      }}
      title={artist ? "Nghệ sỹ" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || "/icon-512.png"}
        alt={alt}
        width={inner}
        height={inner}
        loading="lazy"
        decoding="async"
        style={{
          width: inner,
          height: inner,
          objectFit: "cover",
          display: "block",
          borderRadius: 3,
        }}
      />
    </span>
  );
}
