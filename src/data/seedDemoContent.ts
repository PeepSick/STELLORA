/**
 * One-time, non-destructive seed for the bundled demo photo set's scene/tags/
 * story text.
 *
 * Why this exists: StellorPhotoNote (scene/tags/peopleObserved) and
 * StellorMemoryEdits (story/people/mark) are both localStorage-first by
 * design — the owner's own words, not baked into source (see PROJELER.md,
 * "Faz 2 decision"). That's correct for real personal use, but it means
 * content written via one browser profile (e.g. while testing) never shows
 * up in a different browser profile, even on the same machine — a demo
 * looks broken/empty anywhere except the exact browser it was set up in.
 *
 * This seeds the same localStorage keys those hooks already read, but only
 * for the exact filenames/dayKeys of the bundled example photo set, and
 * only if the key doesn't already exist — so it never overwrites a real
 * edit, and is a complete no-op for anyone using their own photos (their
 * filenames won't match any key here).
 */

const PHOTO_SEED: Record<string, { scene: string; tags: string[]; peopleObserved: number }> = {
  '20250815_143200.jpg': { scene: 'First date, a small coffee shop by the window.', tags: ['first-date', 'cafe'], peopleObserved: 2 },
  '20250906_111000.jpg': { scene: 'Autumn hike, the first leaves just starting to turn.', tags: ['nature', 'hiking'], peopleObserved: 2 },
  '20251011_164500.jpg': { scene: 'Moving day — carrying boxes into the new apartment together.', tags: ['moving', 'home'], peopleObserved: 2 },
  '20251122_192000.jpg': { scene: 'Cooking dinner together in the small kitchen.', tags: ['cooking', 'home'], peopleObserved: 2 },
  '20251224_201500.jpg': { scene: 'Christmas Eve, a cozy evening by the lit-up tree.', tags: ['christmas', 'home'], peopleObserved: 2 },
  '20260101_002000.jpg': { scene: "New Year's Eve, fireworks over the city from the rooftop.", tags: ['new-year', 'celebration'], peopleObserved: 2 },
  '20260214_200000.jpg': { scene: "Valentine's dinner by candlelight.", tags: ['valentines', 'dinner'], peopleObserved: 2 },
  '20260308_150000.jpg': { scene: 'The day they bought their first car together.', tags: ['car', 'milestone'], peopleObserved: 2 },
  '20260329_131000.jpg': { scene: 'A spring picnic under blossoming trees.', tags: ['picnic', 'spring'], peopleObserved: 2 },
  '20260413_090500.jpg': { scene: 'First day at the new job — flowers waiting outside the office.', tags: ['work', 'milestone'], peopleObserved: 2 },
  '20260425_194000.jpg': { scene: 'Anniversary dinner at a nice restaurant.', tags: ['anniversary', 'dinner'], peopleObserved: 2 },
  '20260509_103000.jpg': { scene: 'Bike ride along the river on a sunny morning.', tags: ['cycling', 'nature'], peopleObserved: 2 },
  '20260527_155000.jpg': { scene: 'Painting the new apartment, paint everywhere.', tags: ['home', 'renovation'], peopleObserved: 2 },
  '20260606_124000.jpg': { scene: 'A sunny beach day by the ocean.', tags: ['beach', 'vacation'], peopleObserved: 3 },
  '20260620_183000.jpg': { scene: 'A small birthday party at home, balloons and cake.', tags: ['birthday', 'party'], peopleObserved: 2 },
  '20260701_100000.jpg': { scene: 'A spontaneous road trip on the open highway.', tags: ['road-trip', 'travel'], peopleObserved: 2 },
  '20260715_201000.jpg': { scene: 'Rooftop dinner in the city at sunset.', tags: ['dinner', 'sunset'], peopleObserved: 2 },
  '20260728_172500.jpg': { scene: 'Grocery shopping together, an ordinary day.', tags: ['everyday', 'errands'], peopleObserved: 2 },
  '20260812_075000.jpg': { scene: 'Morning coffee on the balcony at sunrise.', tags: ['morning', 'coffee'], peopleObserved: 2 },
  '20260827_195000.jpg': { scene: 'A quiet sunset walk, hand in hand.', tags: ['walk', 'sunset'], peopleObserved: 2 },
};

const STORY_SEED: Record<string, string> = {
  '2025-08-15': "We sat down for a real coffee together for the first time today. Turns out we were both a little nervous we'd run out of things to say — but the hours just disappeared. I can still picture the light coming through that window.",
  '2025-09-06': 'We decided to go hiking this month — the air was a bit cool but the walk did us good. When we reached the top, we both said the same thing at the same time: I wish it could always be like this.',
  '2025-10-11': "I lost count of how many times we ended up laughing on the floor while carrying boxes. Turning the key to a new place together feels strange in the best way — it's not 'my apartment' anymore, it's 'ours.'",
  '2025-11-22': "The kitchen is tiny but it's enough for the two of us. We cooked together for the first time tonight — the recipe half worked, but that wasn't really the point.",
  '2025-12-24': 'Our first Christmas. We got a small tree and somehow tangled every string of lights trying to put them up, but when they finally lit, we both got a little giddy like kids.',
  '2026-01-01': "We went up to the roof on New Year's Eve, the city glowing below us. When midnight hit, neither of us said anything — we just held on. Sometimes silence is exactly right.",
  '2026-02-14': "We booked a little place for Valentine's Day. None of what we talked about by candlelight was anything special on its own, but all of it together was — that was enough.",
  '2026-03-08': 'We bought our first car today. Holding the keys, I paused for a second — small thing, big step for us. We drove home with the windows down, laughing the whole way.',
  '2026-03-29': 'First warm day of spring, so we spread a blanket in the park and split some sandwiches. Sitting under the blossoming trees always makes everything feel a little more hopeful.',
  '2026-04-13': 'First day at the new job today. Waiting outside the door with flowers in hand, I felt as nervous as if it were my own first day. Their smile said everything.',
  '2026-04-25': "Can't believe it's been a year. We went somewhere nice and raised a glass — looking back at everything that's changed, the one thing that hasn't is that we still choose each other.",
  '2026-05-09': 'We rode bikes along the river, wind in our faces. It felt like a race for a second, but really we were both just soaking up the moment.',
  '2026-05-27': "We decided to paint the apartment and it turned into an actual battlefield — paint everywhere. But the walls are finally the color we picked, and that's its own kind of happiness.",
  '2026-06-06': "We went to the beach, the water still a bit cold but we didn't care. We lay on the sand for hours without saying a word, just watching the waves. It was one of the calmest days.",
  '2026-06-20': 'We threw a small birthday party at home, just the two of us and a few balloons. Big celebrations are nice, but sometimes the simple moments are the best ones.',
  '2026-07-01': "We went on an unplanned road trip, not even fully sure where we were headed. Turns out the road itself can be better than the destination — we figured that out today.",
  '2026-07-15': 'Dinner above the city as the sun went down. When the lights started coming on, we looked at each other and both thought the same thing: how lucky we are.',
  '2026-07-28': 'Just an ordinary grocery run, but we ended up laughing so much today — even arguing over which pasta to buy was fun. Turns out ordinary moments become memories too.',
  '2026-08-12': 'Coffee on the balcony this morning as the sun came up. Sometimes just sitting together in silence is the best morning routine there is.',
  '2026-08-27': 'We walked hand in hand down the street in the evening light, not talking, just smiling. A year behind us, and so many more days still ahead.',
};

let seeded = false;

export function seedDemoContentOnce(): void {
  if (seeded) return;
  seeded = true;
  try {
    for (const [filename, note] of Object.entries(PHOTO_SEED)) {
      const key = 'stellora-photo-' + filename;
      if (localStorage.getItem(key) == null) localStorage.setItem(key, JSON.stringify(note));
    }
    for (const [dayKey, story] of Object.entries(STORY_SEED)) {
      const key = 'stellora-memory-memory-' + dayKey;
      if (localStorage.getItem(key) == null) {
        localStorage.setItem(key, JSON.stringify({ story, people: [], mark: null }));
      }
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — demo just shows the
    // loader's default placeholder text instead. Not fatal.
  }
}
