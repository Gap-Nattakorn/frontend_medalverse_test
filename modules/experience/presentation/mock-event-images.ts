const BASE = "/app/assets/images/image-event.png";

const ALT_IMAGES = [
  "/app/assets/cards/card-01.svg",
  "/app/assets/cards/card-02.svg",
  "/app/assets/cards/card-03.svg",
  "/app/assets/cards/card-04.svg",
  "/app/assets/cards/card-05.svg",
];

function normalizeEventName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const MOCK_EVENT_IMAGES_BY_NAME: Record<string, string[]> = {
  [normalizeEventName("Tech Innovation Summit USA 2025")]: [
    BASE,
    BASE,
    ALT_IMAGES[0],
    ALT_IMAGES[1],
    BASE,
    ALT_IMAGES[2],
    ALT_IMAGES[3],
  ],
  [normalizeEventName("Data Analytics with Python")]: [
    BASE,
    ALT_IMAGES[0],
    ALT_IMAGES[1],
    ALT_IMAGES[2],
  ],
  [normalizeEventName("Global AI Innovation Challenge 2026")]: [
    BASE,
    BASE,
    ALT_IMAGES[4],
  ],
  [normalizeEventName("UX Research for Digital Products")]: [],
};

export function getMockEventImages(eventName?: string | null): string[] | undefined {
  if (!eventName) {
    return undefined;
  }
  return MOCK_EVENT_IMAGES_BY_NAME[normalizeEventName(eventName)];
}

