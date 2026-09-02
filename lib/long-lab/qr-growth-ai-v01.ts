export const QR_GROWTH_GENERATIVE_AI_V01 = {
  id: "qr-growth-generative-ai-1986-human-v0.1",
  name: "QR-Growth Generative AI",
  version: "0.1",
  designReference: "iPhone-style personal companion surface: calm, direct, layered, privacy-first",
  purpose:
    "Create the first measurable AI companion identity grown from a user's Long QR identity, permissions, profile, and approved personalization.",
  identitySeed: {
    qrType: "long-user-growth-dna-qr",
    dnaQrDesign:
      "QR is treated as an identity-growth code similar to a digital DNA pattern, but not as biological data and not as a legal identity replacement.",
    ownerHistory: true,
    personaProfile: true,
    visualStyle: true,
    permissionScope: true,
    revocationPath: true,
  },
  iosSurfaceChecklist: {
    onboarding: ["language", "username", "email-for-preference", "quick-login"],
    account: ["biometric-priority", "social-login-priority", "2fa-default-off", "privacy-settings"],
    interaction: ["notification-inbox-first", "no-unprompted-popup", "clear-confirmation-buttons"],
    storeSafety: ["supportive-ai-language", "consent-gated-human-output", "no-hidden-background-work"],
  },
  humanLikeTraitModel: {
    profile: ["name", "voice-style", "language", "interest-clusters"],
    appearance: ["avatar", "outfit", "color-skin", "mascot-or-human-preview-style"],
    behavior: ["helpfulness", "memory-with-permission", "follow-up-style", "learning-preferences"],
    safeguards: ["consent", "watermark", "qr-trace", "owner-history", "revocation", "risk-review"],
  },
  versioning: {
    personaVersion: "0.1.0",
    visualVersion: "0.1.0-svg-milestone",
    dnaQrVersion: "0.1.0",
    metrics: ["consistency", "permission-fit", "user-control", "human-preview-risk", "store-wording"],
  },
  firstImage: "/long-lab/qr-growth-ai-v01.svg",
  brainTrigger: {
    listensTo: ["nâng cấp", "tại sao", "muốn", "có", "được", "phải"],
    defaultAction: "learn-and-upgrade-proposal",
    userControl: "Default yes for personalization suggestions, user can choose No",
  },
} as const;
