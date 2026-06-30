import { prisma } from '../lib/prisma';

async function main() {
  // Genshin Impact
  const genshin = await prisma.game.create({
    data: {
      title: 'Genshin Impact',
      description: 'Step into Teyvat, a vast world teeming with life and flowing with elemental energy. You and your sibling arrived here from another world.',
      developer: 'Hoyoverse',
      imageUrl: '/images/genshin.jpg',
      chapters: {
        create: [
          { title: 'Prologue: The Outlander Who Caught the Wind', chapterNum: 1, summary: 'The Traveler arrives in Mondstadt and helps Venti and the Knights of Favonius resolve the Stormterror crisis.' },
          { title: 'Chapter I: Farewell, Archaic Lord', chapterNum: 2, summary: 'The Traveler visits Liyue during the Rite of Descension, where Rex Lapis is seemingly assassinated, leading to a hunt for the truth.' },
          { title: 'Chapter II: Omnipresence Over Mortals', chapterNum: 3, summary: 'The Traveler travels to Inazuma, a closed nation ruled by the Raiden Shogun, to overturn the Vision Hunt Decree.' },
        ],
      },
    },
  });

  // Honkai: Star Rail
  const hsr = await prisma.game.create({
    data: {
      title: 'Honkai: Star Rail',
      description: 'Hop aboard the Astral Express and experience the galaxy\'s infinite wonders filled with adventure and thrills.',
      developer: 'Hoyoverse',
      imageUrl: '/images/hsr.jpg',
      chapters: {
        create: [
          { title: 'Prologue: Herta Space Station', chapterNum: 1, summary: 'The Trailblazer is awakened on the Herta Space Station amid an Antimatter Legion attack.' },
          { title: 'Chapter I: In the Withering Wintry Night', chapterNum: 2, summary: 'The Astral Express crew helps the planet Jarilo-VI deal with its Stellaron crisis and the eternal freeze.' },
          { title: 'Chapter II: The Xianzhou Luofu', chapterNum: 3, summary: 'The crew answers a distress signal from the Xianzhou Luofu, a massive fleet, getting involved with the Hunt and the Abundance.' },
        ],
      },
    },
  });

  // Zenless Zone Zero
  const zzz = await prisma.game.create({
    data: {
      title: 'Zenless Zone Zero',
      description: 'Live in New Eridu, the last oasis of humanity, and explore the dangerous Hollows as a Proxy.',
      developer: 'Hoyoverse',
      imageUrl: '/images/zzz.jpg',
      chapters: {
        create: [
          { title: 'Chapter 1: Cat\'s Lost and Found', chapterNum: 1, summary: 'Phaethon helps the Cunning Hares retrieve a lost safe from the Hollows.' },
          { title: 'Chapter 2: In the Wake of Apollo', chapterNum: 2, summary: 'The story involves Belobog Heavy Industries and a conspiracy deep within a massive Hollow.' },
        ],
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
