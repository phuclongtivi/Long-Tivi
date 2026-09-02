export type FollowEdge = {
  followerId: string;
  followingId: string;
  createdAt: string;
};

export function isFollowing(edges: FollowEdge[], me: string, them: string): boolean {
  return edges.some((e) => e.followerId === me && e.followingId === them);
}

export function toggleFollow(
  edges: FollowEdge[],
  me: string,
  them: string
): FollowEdge[] {
  if (me === them) return edges;
  if (isFollowing(edges, me, them)) {
    return edges.filter((e) => !(e.followerId === me && e.followingId === them));
  }
  return [...edges, { followerId: me, followingId: them, createdAt: new Date().toISOString() }];
}

export function followingIds(edges: FollowEdge[], me: string): string[] {
  return edges.filter((e) => e.followerId === me).map((e) => e.followingId);
}
