/** Âm thanh phía người xem. */

export type ViewerAudioRule = {
  /** Reels lướt: video chủ mute */
  reelsHostMuted: true;
  /** Trợ lý BTC hiện trên khung xem */
  showOrganizerAi: true;
  /** Nghe được tiếng trợ lý + nhạc trợ lý phát theo lệnh BTC */
  hearAiAudio: true;
  /** Sau khi Tham gia / mua vé: nghe host + khách mời + AI */
  hearRoomAfterJoin: true;
};

export const VIEWER_AUDIO: ViewerAudioRule = {
  reelsHostMuted: true,
  showOrganizerAi: true,
  hearAiAudio: true,
  hearRoomAfterJoin: true,
};
