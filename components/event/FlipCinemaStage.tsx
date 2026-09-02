"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { EventPost } from "./types";
import { LongLiveMark } from "./LongLiveMark";
import { EventNoticeWallCard } from "./EventNoticeWallCard";
import type { EventNoticeFields } from "./event-notice";
import { isRoomNoticeOnly } from "./live-moderation";
import { RoomCountsLabel } from "./RoomCountsLabel";

const Slide = memo(function Slide({
  post,
  src,
  active,
  warm,
}: {
  post: EventPost;
  src?: string;
  active: boolean;
  warm: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const notice = isRoomNoticeOnly(post.id);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) void video.play().catch(() => undefined);
    else { video.pause(); video.currentTime = 0; }
  }, [active]);
  return (
    <article className={active ? "pl-bb-card on" : "pl-bb-card"}>
      <LongLiveMark size={88} />
      {notice ? (
        <EventNoticeWallCard post={post as EventPost & EventNoticeFields} />
      ) : src ? (
        <video ref={videoRef} src={active || warm ? src : undefined} muted loop playsInline disablePictureInPicture preload={active ? "auto" : warm ? "metadata" : "none"} className="pl-bb-video" />
      ) : (
        <div className="pl-bb-empty">
          <b>{post.title}</b>
        </div>
      )}
      {active ? (
        <footer className="pl-bb-meta">
          <strong>{post.title}</strong>
          <RoomCountsLabel compact counts={{ inside: post.insideCount ?? 0, watching: post.watchingCount ?? 0 }} />
        </footer>
      ) : null}
    </article>
  );
});

export function FlipCinemaStage({
  rooms,
  videoSrcFor,
  onEnter,
}: {
  rooms: EventPost[];
  videoSrcFor?: (post: EventPost) => string | undefined;
  onEnter: (post: EventPost) => void;
}) {
  const [i, setI] = useState(0);
  const y0 = useRef(0);
  const lock = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const dragRef = useRef(0);

  useEffect(() => {
    if (i > rooms.length - 1) setI(Math.max(0, rooms.length - 1));
  }, [rooms.length, i]);

  function flick(dir: 1 | -1) {
    if (lock.current) return;
    lock.current = true;
    setI((n) => Math.min(rooms.length - 1, Math.max(0, n + dir)));
    setTimeout(() => {
      lock.current = false;
    }, 320);
  }

  function paintDrag(y: number) {
    dragRef.current = Math.max(-96, Math.min(96, y));
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      stageRef.current?.style.setProperty('--pl-drag-y', `${dragRef.current}px`);
    });
  }

  function finishDrag() {
    const dy = dragRef.current;
    stageRef.current?.classList.remove('is-dragging');
    paintDrag(0);
    if (dy < -42) flick(1);
    else if (dy > 42) flick(-1);
  }

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  if (!rooms.length) {
    return <p className="pl-chat-empty" style={{ padding: 24, textAlign: "center" }}>Chưa có phiên đang livestream.</p>;
  }

  const cur = rooms[i];
  const stack = [
    rooms[i - 1] ? { post: rooms[i - 1], slot: "prev" as const } : null,
    { post: cur, slot: "cur" as const },
    rooms[i + 1] ? { post: rooms[i + 1], slot: "next" as const } : null,
  ].filter(Boolean) as { post: EventPost; slot: "prev" | "cur" | "next" }[];

  return (
    <div
      ref={stageRef}
      className="pl-bb-stage"
      onPointerDown={(e) => { y0.current = e.clientY; dragRef.current = 0; stageRef.current?.classList.add('is-dragging'); e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; paintDrag(e.clientY - y0.current); }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onWheel={(e) => {
        if (e.deltaY > 24) flick(1);
        if (e.deltaY < -24) flick(-1);
      }}
    >
      <div className="pl-bb-track">
        {stack.map(({ post, slot }) => (
          <div key={post.id} className={"pl-bb-slot pl-bb-" + slot}>
            <Slide post={post} src={videoSrcFor?.(post)} active={slot === "cur"} warm={slot === "next"} />
          </div>
        ))}
      </div>
      <div className="pl-bb-bar">
        <span>
          {i + 1}/{rooms.length} · gẩy để lướt
        </span>
        <button type="button" className="ev-publish" onClick={() => onEnter(cur)}>
          Vào Phòng
        </button>
      </div>
    </div>
  );
}
