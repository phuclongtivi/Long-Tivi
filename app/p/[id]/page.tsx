import type { Metadata } from "next";
import { PermalinkClient } from "@/components/event/PermalinkClient";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const title = "Bài trên Phúc Long Center";
  const desc = "Nội dung đã chia sẻ. Còn trên link này sau khi gỡ tường Home.";
  const url = "https://phuclong.xyz/p/" + id;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "Phúc Long Center",
      type: "article",
      images: [{ url: "https://phuclong.xyz/logo.png" }],
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default function PermalinkPage({ params }: Props) {
  return <PermalinkClient id={params.id} />;
}
