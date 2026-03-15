import type { Achievement, Game, Platform, PsnConsole, PsnTier, XboxConsole } from './types';

export type CatalogGame = {
  id: string;
  platform: Platform;
  title: string;
  artwork?: string;
  sourceUrl?: string;
  platformDetails?: {
    psnConsole?: PsnConsole;
    xboxConsole?: XboxConsole;
  };
  achievements: Achievement[];
};

function ach(id: string, platform: Platform, title: string, description: string, extra: Partial<Achievement> = {}): Achievement {
  return {
    id,
    platform,
    title,
    description,
    unlocked: false,
    ...extra,
  };
}

function psAchievement(id: string, title: string, description: string, tier: PsnTier, rarity?: number): Achievement {
  return ach(id, 'psn', title, description, { psn: { tier }, rarity });
}

function xboxAchievement(id: string, title: string, description: string, gamerscore: number, rarity?: number): Achievement {
  return ach(id, 'xbox', title, description, { xbox: { gamerscore }, rarity });
}

function steamAchievement(id: string, title: string, description: string, points?: number, rarity?: number): Achievement {
  return ach(id, 'steam', title, description, {
    steam: typeof points === 'number' ? { points } : undefined,
    rarity,
  });
}

function psGame(id: string, title: string, psnConsole: PsnConsole, sourceUrl: string, achievements: Achievement[], artwork?: string): CatalogGame {
  return { id, platform: 'psn', title, artwork, sourceUrl, platformDetails: { psnConsole }, achievements };
}

function xboxGame(id: string, title: string, xboxConsole: XboxConsole, sourceUrl: string, achievements: Achievement[], artwork?: string): CatalogGame {
  return { id, platform: 'xbox', title, artwork, sourceUrl, platformDetails: { xboxConsole }, achievements };
}

function steamGame(id: string, title: string, sourceUrl: string, achievements: Achievement[], artwork?: string): CatalogGame {
  return { id, platform: 'steam', title, artwork, sourceUrl, achievements };
}

export const CATALOG_GAMES: CatalogGame[] = [
  // PlayStation
  psGame(
    'ps-astros-playroom',
    "Astro's Playroom",
    'PS5',
    'https://www.eurogamer.net/astros-playroom-trophy-list-how-unlock-hidden-dlc-trophies-7058',
    [
      psAchievement('ps-astro-01', "You've Only Done Everything", "Found all trophies in Astro's Playroom.", 'platinum'),
      psAchievement('ps-astro-02', 'Do it!', 'Cleared Memory Meadow.', 'silver'),
      psAchievement('ps-astro-03', 'Emotion Engine!', 'Cleared SSD Speedway.', 'silver'),
      psAchievement('ps-astro-04', 'Greatness Awaits!', 'Cleared GPU Jungle.', 'silver'),
      psAchievement('ps-astro-05', 'Play Has No Limits!', 'Cleared the game and got the New Generation artefacts.', 'gold'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202008/1721/4YJ4dQY3M6Y4_512.png',
  ),
  psGame(
    'ps-marvels-spider-man-2',
    "Marvel's Spider-Man 2",
    'PS5',
    'https://www.powerpyx.com/marvels-spider-man-2-trophy-guide-roadmap/',
    [
      psAchievement('ps-sm2-01', 'Dedicated', 'Collect all Trophies.', 'platinum'),
      psAchievement('ps-sm2-02', 'Surging Power', 'Use Surge Mode.', 'bronze'),
      psAchievement('ps-sm2-03', 'A New Adventure', 'Help Howard.', 'bronze'),
      psAchievement('ps-sm2-04', 'Heal the World', 'Finish the main story.', 'gold'),
      psAchievement('ps-sm2-05', 'Superior', '100% complete all districts.', 'gold'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/33b0f0c89f0bf62f36de8d2a644d5ec6ec03af7f7f3df6b7.png',
  ),
  psGame(
    'ps-god-of-war-ragnarok',
    'God of War Ragnarök',
    'PS5',
    'https://www.powerpyx.com/god-of-war-ragnarok-trophy-guide-roadmap/',
    [
      psAchievement('ps-gowr-01', 'The Bear and the Wolf', 'Collect all Trophies.', 'platinum'),
      psAchievement('ps-gowr-02', 'The Florist', 'Collect one flower from each of the nine realms.', 'bronze'),
      psAchievement('ps-gowr-03', 'Blood Debt', 'Battle the God of Thunder.', 'gold'),
      psAchievement('ps-gowr-04', 'The True Queen', 'Battle Gná.', 'gold'),
      psAchievement('ps-gowr-05', 'Full Belly', 'Obtain all of the Apples of Idunn and Horns of Blood Mead.', 'silver'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/7o1F9qh0K8YkTqAizI0s5mom.png',
  ),
  psGame(
    'ps-ratchet-clank-rift-apart',
    'Ratchet & Clank: Rift Apart',
    'PS5',
    'https://www.powerpyx.com/ratchet-clank-rift-apart-trophy-guide-roadmap/',
    [
      psAchievement('ps-racra-01', 'Masters of the Multiverse', 'Collect All Trophies.', 'platinum'),
      psAchievement('ps-racra-02', 'Hide "N" Seekerpede', 'Complete a Seekerpede challenge.', 'bronze'),
      psAchievement('ps-racra-03', 'BOING!', 'Bounce on Big Al, Clank, and Qwark’s inflatable parade floats.', 'bronze'),
      psAchievement('ps-racra-04', 'They Blow Up So Fast', 'Get a Wombo Combo using the Cold Snap, Glove of Doom, and Bombardier.', 'silver'),
      psAchievement('ps-racra-05', 'Fully Stacked', 'Upgrade a weapon to level five.', 'silver'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202101/2921/0GAnD46qP1JpQdG7FQ9gUQ4D.png',
  ),
  psGame(
    'ps-horizon-forbidden-west',
    'Horizon Forbidden West',
    'PS5',
    'https://www.powerpyx.com/horizon-forbidden-west-trophy-guide-roadmap/',
    [
      psAchievement('ps-hfw-01', 'All Trophies Obtained', 'Obtained all Horizon Forbidden West trophies.', 'platinum'),
      psAchievement('ps-hfw-02', 'Reached the Daunt', 'Arrived at the Daunt seeking passage to the Forbidden West.', 'bronze'),
      psAchievement('ps-hfw-03', 'Recovered AETHER', 'Recovered AETHER and defended the Kulrut.', 'silver'),
      psAchievement('ps-hfw-04', 'Discovered Nemesis', 'Put an end to the Zenith threat and discovered Nemesis.', 'gold'),
      psAchievement('ps-hfw-05', 'Completed 2 Flying Mount Quests', 'Completed 2 quests requiring a flying mount.', 'silver'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/TRJx5jv3iXWQ7spCZwTe74Mk.png',
  ),
  psGame(
    'ps-ghost-of-tsushima',
    'Ghost of Tsushima',
    'PS4',
    'https://www.powerpyx.com/ghost-of-tsushima-trophy-guide-roadmap/',
    [
      psAchievement('ps-got-01', 'Living Legend', 'Obtain all trophies.', 'platinum'),
      psAchievement('ps-got-02', 'The Warrior Monk', 'Complete all Tales of Norio.', 'silver'),
      psAchievement('ps-got-03', 'There Can Be Only One', 'Successfully complete every duel.', 'gold'),
      psAchievement('ps-got-04', 'Point of No Return', 'Break your code to help a new friend.', 'silver'),
      psAchievement('ps-got-05', 'A Charming Man', 'Equip a charm in all 6 slots.', 'bronze'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202010/2217/VlXmQG2B2G0vVvG8eK3opg4A.png',
  ),
  psGame(
    'ps-the-last-of-us-part-i',
    'The Last of Us Part I',
    'PS5',
    'https://www.powerpyx.com/the-last-of-us-part-1-trophy-guide-roadmap/',
    [
      psAchievement('ps-tlou1-01', 'It Can’t Be For Nothing', 'Collect all trophies.', 'platinum'),
      psAchievement('ps-tlou1-02', 'No Matter What', 'Complete Part 1.', 'gold'),
      psAchievement('ps-tlou1-03', 'Endure and Survive', 'Collect all comics.', 'silver'),
      psAchievement('ps-tlou1-04', 'Chronicles', 'Find all notes and artifacts.', 'silver'),
      psAchievement('ps-tlou1-05', 'Skillz', 'Upgrade one of your skill branches to tier 4.', 'bronze'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202206/0918/32wzjvT7P6wQn0SI7RyhokW2.png',
  ),
  psGame(
    'ps-returnal',
    'Returnal',
    'PS5',
    'https://www.powerpyx.com/returnal-trophy-guide-roadmap/',
    [
      psAchievement('ps-returnal-01', 'Helios', 'Collect all Trophies.', 'platinum'),
      psAchievement('ps-returnal-02', 'Atropian Survival', 'Finish the Overgrown Ruins Survey.', 'silver'),
      psAchievement('ps-returnal-03', 'Past the Ruins', 'Finish Overgrown Ruins.', 'gold'),
      psAchievement('ps-returnal-04', 'White Shadow', 'Complete Act 1.', 'gold'),
      psAchievement('ps-returnal-05', 'Sins of the Mother', 'Complete all House sequences.', 'silver'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202011/1621/3l4S8xP5K7NqE0Bf0YvG2l2M.png',
  ),
  psGame(
    'ps-demons-souls',
    "Demon's Souls",
    'PS5',
    'https://www.powerpyx.com/demons-souls-ps5-remake-trophy-guide-roadmap/',
    [
      psAchievement('ps-ds-01', 'Slayer of Trophies', 'All Trophies obtained.', 'platinum'),
      psAchievement('ps-ds-02', 'Phalanx’s Trophy', 'Vanquish Phalanx.', 'bronze'),
      psAchievement('ps-ds-03', 'Tower Knight’s Trophy', 'Vanquish Tower Knight.', 'bronze'),
      psAchievement('ps-ds-04', 'Flamelurker’s Trophy', 'Vanquish Flamelurker.', 'bronze'),
      psAchievement('ps-ds-05', 'Seekest soul power, dost thou not?', 'Embrace the power of the Old One.', 'gold'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202009/3021/BtsjAgHT8J6i2GJ0E8xmPKzW.png',
  ),
  psGame(
    'ps-helldivers-2',
    'Helldivers 2',
    'PS5',
    'https://www.powerpyx.com/helldivers-2-trophy-guide-roadmap/',
    [
      psAchievement('ps-hd2-01', 'The Final Frontier', 'Obtain all trophies.', 'platinum'),
      psAchievement('ps-hd2-02', 'Hell Dive', 'Complete an Extreme difficulty mission or higher without anyone dying.', 'gold'),
      psAchievement('ps-hd2-03', 'Doing Your Part', 'Complete at least 100 missions.', 'silver'),
      psAchievement('ps-hd2-04', 'Samples are a Diver’s Best Friend', 'Extract with 15 Common Samples.', 'bronze'),
      psAchievement('ps-hd2-05', 'Gone in 360 Seconds!', 'Complete a Blitz search and destroy mission in under 6 minutes.', 'silver'),
    ],
    'https://image.api.playstation.com/vulcan/ap/rnd/202401/2517/3a7d0f2b8fe38d4c55caef8dd1e9d2a729f86f8fd27d26f3.png',
  ),

  // Xbox
  xboxGame(
    'xbox-halo-infinite',
    'Halo Infinite',
    'Xbox Series X|S',
    'https://www.halopedia.org/Achievements_(Halo_Infinite)',
    [
      xboxAchievement('xbox-halo-01', 'First Contact', 'Lost, and found.', 10),
      xboxAchievement('xbox-halo-02', 'Ascension', 'Defeated the Banished warlord Tremonius.', 10),
      xboxAchievement('xbox-halo-03', 'Zeta', 'Fought your way through Outpost Tremonius and stepped out onto the surface of Zeta Halo.', 10),
      xboxAchievement('xbox-halo-04', 'Set a Fire in Your Heart', 'Completed the main campaign.', 30),
      xboxAchievement('xbox-halo-05', 'A True Test of Legends', 'Completed all main campaign missions on Legendary difficulty.', 30),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg',
  ),
  xboxGame(
    'xbox-forza-horizon-5',
    'Forza Horizon 5',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Forza-Horizon-5/achievements',
    [
      xboxAchievement('xbox-fh5-01', 'Welcome to Mexico', 'Complete the initial drive to the Horizon Festival.', 10),
      xboxAchievement('xbox-fh5-02', 'Race into Action', 'Complete any Horizon Race Event.', 10),
      xboxAchievement('xbox-fh5-03', 'Adaptable', 'Complete the On a Wing and a Prayer Showcase Event.', 10),
      xboxAchievement('xbox-fh5-04', 'Hall of Famer', 'Reach the Horizon Hall of Fame.', 80),
      xboxAchievement('xbox-fh5-05', 'Living Legend', 'Earn 294 stars from PR Stunts in Mexico.', 30),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg',
  ),
  xboxGame(
    'xbox-sea-of-thieves',
    'Sea of Thieves',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Sea-of-Thieves/achievements',
    [
      xboxAchievement('xbox-sot-01', 'Now Bring Me That Horizon', 'Complete the Maiden Voyage.', 10),
      xboxAchievement('xbox-sot-02', 'A Fresh Reputation', 'Reach reputation grade 5 in any Trading Company.', 10),
      xboxAchievement('xbox-sot-03', 'Maiden Voyager', 'Complete all Commendations for the Maiden Voyage.', 30),
      xboxAchievement('xbox-sot-04', 'How Appropriate!', 'Purchase a new Title.', 10),
      xboxAchievement('xbox-sot-05', 'Legend of the Sea of Thieves', 'Become a Pirate Legend.', 100),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/header.jpg',
  ),
  xboxGame(
    'xbox-gears-5',
    'Gears 5',
    'Xbox One',
    'https://www.trueachievements.com/game/Gears-5/achievements',
    [
      xboxAchievement('xbox-g5-01', 'Home at Last', 'Complete Act I of the campaign.', 10),
      xboxAchievement('xbox-g5-02', 'Back at Cha', 'Complete Act II of the campaign.', 15),
      xboxAchievement('xbox-g5-03', 'Jack of All Trades', 'Acquire all of Jack’s ultimate upgrades.', 15),
      xboxAchievement('xbox-g5-04', 'Discovered the True Threat to Sera', 'Complete the campaign.', 50),
      xboxAchievement('xbox-g5-05', 'Beat the Challenge', 'Complete the campaign on Insane difficulty.', 100),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1097840/header.jpg',
  ),
  xboxGame(
    'xbox-ori-will-of-the-wisps',
    'Ori and the Will of the Wisps',
    'Xbox One',
    'https://www.trueachievements.com/game/Ori-and-the-Will-of-the-Wisps/achievements',
    [
      xboxAchievement('xbox-oriw-01', 'Take the Bug by the Horn', 'Defeat Kwolok.', 20),
      xboxAchievement('xbox-oriw-02', 'Timber!', 'Defeat Mora.', 20),
      xboxAchievement('xbox-oriw-03', 'Guardian’s Rest', 'Defeat the Sandworm.', 20),
      xboxAchievement('xbox-oriw-04', 'Destiny', 'Complete the game.', 30),
      xboxAchievement('xbox-oriw-05', 'Look at the Time', 'Complete the game in under 4 hours.', 40),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1057090/header.jpg',
  ),
  xboxGame(
    'xbox-hi-fi-rush',
    'Hi-Fi RUSH',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/HiFi-RUSH/achievements',
    [
      xboxAchievement('xbox-hfr-01', 'My First Concert', 'Complete Track 1.', 15),
      xboxAchievement('xbox-hfr-02', 'Rock and Roll', 'Complete Track 2.', 15),
      xboxAchievement('xbox-hfr-03', 'One More Time', 'Complete the game on any difficulty.', 30),
      xboxAchievement('xbox-hfr-04', 'S Rank Investigator', 'Get an S Rank on every level.', 40),
      xboxAchievement('xbox-hfr-05', 'I Saw All of Them', 'Find every mural at Vandelay Campus.', 20),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1817230/header.jpg',
  ),
  xboxGame(
    'xbox-psychonauts-2',
    'Psychonauts 2',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Psychonauts-2/achievements',
    [
      xboxAchievement('xbox-psy2-01', 'Youngest Intern', 'Complete the Basic Braining tutorial.', 10),
      xboxAchievement('xbox-psy2-02', 'Duck, Duck, Goose', 'Complete Hollis’ Classroom.', 20),
      xboxAchievement('xbox-psy2-03', 'Perfectly Balanced', 'Find and return all Figments to a single Mind.', 20),
      xboxAchievement('xbox-psy2-04', 'Unlimited Power!', 'Fully upgrade one of Raz’s Psi Powers.', 20),
      xboxAchievement('xbox-psy2-05', 'Math Is Hard', 'Complete Loboto’s Labyrinth.', 20),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/607080/header.jpg',
  ),
  xboxGame(
    'xbox-grounded',
    'Grounded',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Grounded/achievements',
    [
      xboxAchievement('xbox-grounded-01', 'Welcome to Grounded', 'Complete the ominent onboarding experience.', 10),
      xboxAchievement('xbox-grounded-02', 'Javelineer', 'Throw a pebblet spear over 30 cm.', 10),
      xboxAchievement('xbox-grounded-03', 'Fortified', 'Place your first Wall.', 10),
      xboxAchievement('xbox-grounded-04', 'Shrinking More', 'Complete the main story.', 40),
      xboxAchievement('xbox-grounded-05', 'Super Win', 'Beat the Director.', 30),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/962130/header.jpg',
  ),
  xboxGame(
    'xbox-pentiment',
    'Pentiment',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Pentiment/achievements',
    [
      xboxAchievement('xbox-pentiment-01', 'A New Home', 'Arrive in Tassing.', 10),
      xboxAchievement('xbox-pentiment-02', 'Journeyman', 'Complete Act One.', 20),
      xboxAchievement('xbox-pentiment-03', 'Masterpiece', 'Complete the game.', 40),
      xboxAchievement('xbox-pentiment-04', 'Bookworm', 'Read 20 books.', 20),
      xboxAchievement('xbox-pentiment-05', 'Teacher', 'Teach all the village children.', 20),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1205520/header.jpg',
  ),
  xboxGame(
    'xbox-tunic',
    'TUNIC',
    'Xbox Series X|S',
    'https://www.trueachievements.com/game/Tunic/achievements',
    [
      xboxAchievement('xbox-tunic-01', 'A Stick!', 'Found your first weapon.', 10),
      xboxAchievement('xbox-tunic-02', 'What Just Happened?', 'Defeat the Heir.', 30),
      xboxAchievement('xbox-tunic-03', 'Your Future Awaits', 'Collect the full Manual.', 40),
      xboxAchievement('xbox-tunic-04', 'Bring it to the Wrong Fight', 'Use a magic dagger to freeze an enemy.', 10),
      xboxAchievement('xbox-tunic-05', 'Too Cute to Smash', 'Pet the fox.', 10),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/header.jpg',
  ),

  // Steam
  steamGame(
    'steam-hades',
    'Hades',
    'https://steamcommunity.com/stats/1145360/achievements',
    [
      steamAchievement('steam-hades-01', 'Escaped Tartarus', 'Clear Tartarus'),
      steamAchievement('steam-hades-02', 'Escaped Asphodel', 'Clear Asphodel'),
      steamAchievement('steam-hades-03', 'Escaped Elysium', 'Clear Elysium'),
      steamAchievement('steam-hades-04', 'Is There No Escape?', 'Clear an escape attempt'),
      steamAchievement('steam-hades-05', 'The Family Secret', 'Complete the main quest in the story'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
  ),
  steamGame(
    'steam-portal-2',
    'Portal 2',
    'https://steamcommunity.com/stats/620/achievements',
    [
      steamAchievement('steam-portal2-01', 'Wake Up Call', 'Survive the manual override.'),
      steamAchievement('steam-portal2-02', 'You Monster', 'Reunite with GLaDOS.'),
      steamAchievement('steam-portal2-03', 'Undiscouraged', 'Complete the first Thermal Discouragement Beam test.'),
      steamAchievement('steam-portal2-04', 'Pit Boss', 'Show that pit who’s boss.'),
      steamAchievement('steam-portal2-05', 'Lunacy', 'That just happened.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
  ),
  steamGame(
    'steam-celeste',
    'Celeste',
    'https://steamcommunity.com/stats/504230/achievements',
    [
      steamAchievement('steam-celeste-01', 'First Steps', 'Complete Chapter 1.'),
      steamAchievement('steam-celeste-02', 'Resurrections', 'Complete Chapter 2.'),
      steamAchievement('steam-celeste-03', 'Checking Out', 'Complete Chapter 3.'),
      steamAchievement('steam-celeste-04', 'Reach the Summit', 'Complete Chapter 7.'),
      steamAchievement('steam-celeste-05', 'Impress Your Friends', 'Collect 30 strawberries.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
  ),
  steamGame(
    'steam-hollow-knight',
    'Hollow Knight',
    'https://steamcommunity.com/stats/367520/achievements',
    [
      steamAchievement('steam-hk-01', 'Falsehood', 'Defeat the False Knight.'),
      steamAchievement('steam-hk-02', 'Release', 'Defeat the Broken Vessel.'),
      steamAchievement('steam-hk-03', 'Honour', 'Defeat the Dung Defender.'),
      steamAchievement('steam-hk-04', 'Witness', 'Get the Dream Nail.'),
      steamAchievement('steam-hk-05', 'The Hollow Knight', 'Defeat the Hollow Knight and complete the game.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
  ),
  steamGame(
    'steam-vampire-survivors',
    'Vampire Survivors',
    'https://steamcommunity.com/stats/1794680/achievements',
    [
      steamAchievement('steam-vs-01', 'Getting Started', 'Finish the tutorial.'),
      steamAchievement('steam-vs-02', 'Arca', 'Unlock Arca.'),
      steamAchievement('steam-vs-03', 'Library', 'Reach Level 20 in Mad Forest.'),
      steamAchievement('steam-vs-04', 'The Bone Zone', 'Unlock the Bone Zone.'),
      steamAchievement('steam-vs-05', 'Queen Sigma', 'Unlock Queen Sigma.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg',
  ),
  steamGame(
    'steam-slay-the-spire',
    'Slay the Spire',
    'https://steamcommunity.com/stats/646570/achievements',
    [
      steamAchievement('steam-sts-01', 'The Guardian', 'Defeat The Guardian.'),
      steamAchievement('steam-sts-02', 'The Champ', 'Defeat The Champ.'),
      steamAchievement('steam-sts-03', 'Beyond Perfect', 'Defeat a boss without taking any damage.'),
      steamAchievement('steam-sts-04', 'Impervious', 'Win with a single Relic.'),
      steamAchievement('steam-sts-05', 'The Transient', 'Defeat The Transient before it fades away.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg',
  ),
  steamGame(
    'steam-balatro',
    'Balatro',
    'https://steamcommunity.com/stats/2379780/achievements',
    [
      steamAchievement('steam-balatro-01', 'Ante Up!', 'Reach Ante 4.'),
      steamAchievement('steam-balatro-02', 'Mid Stakes', 'Win a run on Red Stake difficulty or higher.'),
      steamAchievement('steam-balatro-03', 'Rule Bender', 'Complete a challenge run.'),
      steamAchievement('steam-balatro-04', 'Retrograde', 'Win a run using only 4 jokers.'),
      steamAchievement('steam-balatro-05', 'Completionist', 'Discover 100% of your collection.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/header.jpg',
  ),
  steamGame(
    'steam-stardew-valley',
    'Stardew Valley',
    'https://steamcommunity.com/stats/413150/achievements',
    [
      steamAchievement('steam-sdv-01', 'Greenhorn', 'Earn 15,000g.'),
      steamAchievement('steam-sdv-02', 'Cowpoke', 'Earn 50,000g.'),
      steamAchievement('steam-sdv-03', 'Moving Up', 'Upgrade your house.'),
      steamAchievement('steam-sdv-04', 'Mother Catch', 'Catch 100 fish.'),
      steamAchievement('steam-sdv-05', 'Legend', 'Earn 10,000,000g.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
  ),
  steamGame(
    'steam-dave-the-diver',
    'Dave the Diver',
    'https://steamcommunity.com/stats/1868140/achievements',
    [
      steamAchievement('steam-dtd-01', 'Bancho Sushi is Back!', 'Open Bancho Sushi.'),
      steamAchievement('steam-dtd-02', 'The Best Employee', 'Hire your first employee.'),
      steamAchievement('steam-dtd-03', 'Gyao!', 'Meet a beluga whale.'),
      steamAchievement('steam-dtd-04', 'A Noisy Customer', 'Meet Momo.'),
      steamAchievement('steam-dtd-05', 'The Final Chapter', 'Complete the main story.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/header.jpg',
  ),
  steamGame(
    'steam-disco-elysium',
    'Disco Elysium - The Final Cut',
    'https://steamcommunity.com/stats/632470/achievements',
    [
      steamAchievement('steam-de-01', 'Goodest of the Good Cops', 'Take all the advanced Good Cop/Bad Cop tasks.'),
      steamAchievement('steam-de-02', 'The Figurines Won’t Win Her Back', 'Find the Insulindian Phasmid.'),
      steamAchievement('steam-de-03', 'Medal Dispenser', 'Ask Kim to tell you about his motor carriage.'),
      steamAchievement('steam-de-04', 'Biggest Communism Builder', 'Opt in for every communist thought and political action.'),
      steamAchievement('steam-de-05', 'Palerunner', 'Finish the game in Hardcore mode.'),
    ],
    'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg',
  ),
];

export const CATALOG_BY_ID = new Map(CATALOG_GAMES.map((g) => [g.id, g]));

export function cloneCatalogGameToLibrary(g: CatalogGame): Game {
  return {
    id: `${g.id}-${Date.now()}`,
    platform: g.platform,
    title: g.title,
    artwork: g.artwork,
    platformDetails: g.platformDetails,
    status: 'to-play',
    source: {
      kind: 'catalog',
      externalId: g.id,
      url: g.sourceUrl,
    },
    achievements: g.achievements.map((a) => ({ ...a, id: `${a.id}-${Date.now()}-${Math.random().toString(16).slice(2)}` })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
