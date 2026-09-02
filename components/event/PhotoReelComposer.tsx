"use client";

import { useRef, useState } from "react";
import {
  addPhotoReel,
  bakePhotoVideo,
  readImageFile,
  type PhotoReel,
} from "./photo-reels";
import { publishArchive } from "./post-archive";

export function PhotoReelComposer({
  author,
  onPosted,
  onClose,
}: {
  author: string;
  onPosted: (r: PhotoReel) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const box = {
    background: "transparent",
    border: "2px solid var(--pl-frame)",
    boxShadow: "0 0 0 1px var(--pl-frame-soft)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  } as const;

  return (
    <div
      style={{
        ...box,
        margin: "0 0 14px",
        padding: 12,
        color: "var(--pl-text)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Video nhanh từ ảnh có sẵn</div>
      <label style={box}>
        Tiêu đề
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề video"
          style={{
            width: "100%",
            marginTop: 4,
            background: "transparent",
            color: "inherit",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </label>
      <label style={box}>
        Nội dung mô tả
        <textarea
          required
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="Mô tả ngắn…"
          style={{
            width: "100%",
            marginTop: 4,
            background: "transparent",
            color: "inherit",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        style={{
          height: 36,
          padding: "0 12px",
          border: "2px solid var(--pl-frame)",
          background: "transparent",
          color: "inherit",
          fontWeight: 800,
          borderRadius: 10,
        }}
      >
        Chọn ảnh trên máy
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = e.target.files ? Array.prototype.slice.call(e.target.files, 0, 8) : [];
          e.target.value = "";
          setErr("");
          const next: string[] = [];
          for (let i = 0; i < files.length; i++) {
            try {
              next.push(await readImageFile(files[i]));
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Ảnh lỗi");
            }
          }
          setImages(next);
        }}
      />
      {images.length ? <span style={{ marginLeft: 8, fontSize: 12 }}>{images.length}</span> : null}
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          style={{ width: 56, height: 56, objectFit: "cover", margin: "8px 6px 0 0", border: "2px solid var(--pl-frame)" }}
        />
      ))}
      {err ? <p style={{ color: "#E11D48", fontSize: 12 }}>{err}</p> : null}
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!title.trim() || !desc.trim()) {
              setErr("Nhập tiêu đề và mô tả.");
              return;
            }
            if (!images.length) {
              setErr("Chọn ít nhất 1 ảnh trên máy.");
              return;
            }
            setBusy(true);
            setErr("");
            try {
              const videoUrl = await bakePhotoVideo(images);
              const reel: PhotoReel = {
                id: "pr-" + Date.now(),
                title: title.trim(),
                description: desc.trim(),
                images,
                videoUrl,
                createdAt: new Date().toISOString(),
                author,
                likesCount: 0,
                comments: [],
              };
              addPhotoReel(reel);
              await publishArchive({
                id: reel.id,
                kind: "photo-reel",
                title: reel.title,
                description: reel.description,
                author: reel.author,
                createdAt: reel.createdAt,
                firstImage: images[0],
                videoUrl: videoUrl,
              });
              onPosted(reel);
            } catch {
              setErr("Không tạo được video. Thử ảnh khác.");
            } finally {
              setBusy(false);
            }
          }}
          style={{
            height: 40,
            padding: "0 14px",
            border: "none",
            borderRadius: 10,
            background: "#E11D48",
            color: "#fff",
            fontWeight: 800,
            marginRight: 8,
          }}
        >
          {busy ? "Đang ghép…" : "Tạo video & đăng tường"}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            height: 40,
            border: "none",
            background: "transparent",
            color: "inherit",
            fontWeight: 700,
            textDecoration: "underline",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
