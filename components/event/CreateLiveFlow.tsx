"use client";

import { useState } from "react";
import type { EventPost } from "./types";
import { EventAnnounceForm } from "./EventAnnounceForm";
import { OrganizerLiveDesk } from "./OrganizerLiveDesk";
import { downloadJpg } from "./announce-poster";

export function CreateLiveFlow({
  organizerName,
  organizerId,
  organizerRole = "artist",
  gender = "neutral",
  onPushHome,
  onListProduct,
}: {
  organizerName: string;
  organizerId: string;
  organizerRole?: EventPost["organizerRole"];
  gender?: import("./ai-companion").AiGender;
  onPushHome?: (post: EventPost) => void;
  onListProduct?: (post: EventPost) => void;
}) {
  const [post, setPost] = useState<(EventPost & { posterJpg?: string }) | null>(null);

  if (!post) {
    return (
      <EventAnnounceForm
        organizerName={organizerName}
        organizerId={organizerId}
        organizerRole={organizerRole}
        gender={gender}
        onComplete={(draft) => {
          const full: EventPost & { posterJpg: string } = {
            ...draft,
            id: "ev-" + Date.now(),
          };
          if (full.posterJpg) downloadJpg(full.posterJpg, `thong-bao-${full.id}.jpg`);
          onPushHome?.(full);
          if (full.introduceProduct && (full.productIntros?.length || full.productIntro)) onListProduct?.(full);
          setPost(full);
        }}
      />
    );
  }

  return (
    <OrganizerLiveDesk
      post={post}
      inside={0}
      preview={
        post.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.posterUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : undefined
      }
    />
  );
}
