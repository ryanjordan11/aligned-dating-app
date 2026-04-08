export interface Profile {
  id: number;
  name: string;
  age: number;
  gender: "female" | "male" | "non-binary";
  image: string;
  zodiac: string;
  zodiacEmoji: string;
  spiritualPath: string;
  meditationLevel: string;
  chakraAlignment: number;
  bio: string;
  interests: string[];
  distance: string;
  distanceKm: number;
}

// Landing collage mock profiles (static assets in `/public/landing`).
export const profiles: Profile[] = [
  {
    id: 1,
    name: "Luna",
    age: 26,
    gender: "female",
    image: "/landing/profile-1.jpg",
    zodiac: "Pisces",
    zodiacEmoji: "♓",
    spiritualPath: "Yoga & Meditation",
    meditationLevel: "Advanced",
    chakraAlignment: 92,
    bio: "Seeking a soul connection beyond the physical realm ✨",
    interests: ["Astrology", "Crystal Healing", "Breathwork", "Vedic Chanting"],
    distance: "3 km away",
    distanceKm: 3,
  },
  {
    id: 2,
    name: "Kai",
    age: 29,
    gender: "male",
    image: "/landing/profile-2.jpg",
    zodiac: "Sagittarius",
    zodiacEmoji: "♐",
    spiritualPath: "Buddhist Meditation",
    meditationLevel: "Intermediate",
    chakraAlignment: 78,
    bio: "Walking the path of mindfulness, seeking a companion for the journey 🙏",
    interests: ["Mindfulness", "Nature Walks", "Sound Healing", "Tai Chi"],
    distance: "5 km away",
    distanceKm: 5,
  },
  {
    id: 3,
    name: "Aria",
    age: 24,
    gender: "female",
    image: "/landing/profile-3.jpg",
    zodiac: "Scorpio",
    zodiacEmoji: "♏",
    spiritualPath: "Energy Healing",
    meditationLevel: "Advanced",
    chakraAlignment: 88,
    bio: "My crystals told me you'd swipe right 💎",
    interests: ["Reiki", "Tarot Reading", "Moon Circles", "Herbalism"],
    distance: "2 km away",
    distanceKm: 2,
  },
];

