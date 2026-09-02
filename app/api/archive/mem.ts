export type ArchiveRow = {
  id: string;
  kind?: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  posterUrl?: string;
};

export const archiveMem: Record<string, ArchiveRow> = {};
