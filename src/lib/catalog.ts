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
      psAchievement('ps-astro-06', 'The Last Guy', 'Rescued all bots in CPU Plaza.', 'silver'),
      psAchievement('ps-astro-07', 'A Grand Tour!', 'Completed all 4 main areas and CPU Plaza.', 'gold'),
      psAchievement('ps-astro-08', 'Jumping Splash!', 'Found the springy amusement in GPU Jungle.', 'bronze'),
      psAchievement('ps-astro-09', 'Hell Diver', 'Dived into the water from the diving board in Memory Meadow.', 'bronze'),
      psAchievement('ps-astro-10', 'You Got to Run!', 'Found and defeated the boss beneath SSD Speedway.', 'silver'),
    
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
      psAchievement('ps-sm2-06', 'To the Max', 'Purchase all gadget upgrades.', 'silver'),
      psAchievement('ps-sm2-07', 'Kitted Out', 'Purchase all available Suits.', 'silver'),
      psAchievement('ps-sm2-08', 'Slack Line', 'Stealth takedown 25 enemies in stealth from the Web Line.', 'bronze'),
      psAchievement('ps-sm2-09', 'Hang Ten', 'Perform 30 Air Tricks in a row without touching the ground.', 'bronze'),
      psAchievement('ps-sm2-10', 'Home Run!', 'Round the bases at the Big Apple Ballers Stadium.', 'bronze'),
    
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
      psAchievement('ps-gowr-06', 'The Librarian', 'Collect all of the Books.', 'bronze'),
      psAchievement('ps-gowr-07', 'How it Started', 'Equip an Enchantment.', 'bronze'),
      psAchievement('ps-gowr-08', 'Spit Shine', 'Upgrade one piece of armor.', 'bronze'),
      psAchievement('ps-gowr-09', 'Knock off the Rust', 'Purchase a skill.', 'bronze'),
      psAchievement('ps-gowr-10', 'A Grizzly Encounter', 'Battle the bear.', 'gold'),
    
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
      psAchievement('ps-racra-06', 'Shifty Character', 'Hit every Blizon Crystal on Blizar and Cordelion.', 'silver'),
      psAchievement('ps-racra-07', 'Max Relax', 'Find CraiggerBears on five planets.', 'silver'),
      psAchievement('ps-racra-08', 'Nooks and Crannies', 'Collect five Gold Bolts.', 'bronze'),
      psAchievement('ps-racra-09', 'Quantum Mechanic', 'Repair the Dimensionator.', 'gold'),
      psAchievement('ps-racra-10', 'Just Stay Down', 'Defeat Dr. Nefarious and Emperor Nefarious.', 'gold'),
    
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
      psAchievement('ps-hfw-06', 'Used Dye Flowers', 'Used dye flowers to unlock and apply a new dye.', 'bronze'),
      psAchievement('ps-hfw-07', 'First Tallneck Overridden', 'Scaled a Tallneck and accessed its information.', 'bronze'),
      psAchievement('ps-hfw-08', 'Completed a Set of Salvage Contracts', 'Completed all contracts for one Salvage Contractor.', 'bronze'),
      psAchievement('ps-hfw-09', 'Obtained 3 Stripes at a Hunting Ground', 'Earned at least a Quarter Stripe mark in all three trials at one Hunting Ground.', 'bronze'),
      psAchievement('ps-hfw-10', 'Recovered POSEIDON', 'Recovered POSEIDON.', 'silver'),
    
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
      psAchievement('ps-got-06', 'For Tsushima', 'Liberate all occupied areas in Izuhara.', 'silver'),
      psAchievement('ps-got-07', 'Open for Business', 'Stagger enemies 50 times.', 'bronze'),
      psAchievement('ps-got-08', 'All in the Wrist', 'Defeat the maximum amount of enemies within a single Standoff.', 'bronze'),
      psAchievement('ps-got-09', 'Favorite Brew', 'Acquire and equip a gear item in every slot.', 'bronze'),
      psAchievement('ps-got-10', 'Witness Protection', 'Shoot a Terrified enemy with an arrow while they are fleeing.', 'bronze'),
    
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
      psAchievement('ps-tlou1-06', 'Sticky Fingers', 'Open all safes.', 'silver'),
      psAchievement('ps-tlou1-07', 'Prepared For the Worst', 'Find all workbenches.', 'bronze'),
      psAchievement('ps-tlou1-08', 'Build Em Up, Break Em Down', 'Upgrade and then break one of every melee weapon.', 'bronze'),
      psAchievement('ps-tlou1-09', 'Master of Unlocking', 'Break into every locked door using shivs.', 'silver'),
      psAchievement('ps-tlou1-10', 'I Got This', 'Win Left Behind’s water gun fight.', 'bronze'),
    
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
      psAchievement('ps-returnal-06', 'Echoes of the Past', 'Finish Echoing Ruins Survey.', 'silver'),
      psAchievement('ps-returnal-07', 'Ascension', 'Complete Act 2.', 'gold'),
      psAchievement('ps-returnal-08', 'In-Field Training', 'Complete a daily challenge in Simulation Mode.', 'bronze'),
      psAchievement('ps-returnal-09', 'Cryptic Messages', 'Scan a Xeno-Glyph.', 'bronze'),
      psAchievement('ps-returnal-10', 'Adapting to Circumstance', 'Reach Weapon Proficiency level 30.', 'silver'),
    
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
      psAchievement('ps-ds-06', 'The Slayer of Demon “Armor Spider”', 'Vanquish Armor Spider.', 'bronze'),
      psAchievement('ps-ds-07', 'The Slayer of Demon “Penetrator”', 'Vanquish Penetrator.', 'bronze'),
      psAchievement('ps-ds-08', 'The Slayer of Demon “Old Hero”', 'Vanquish Old Hero.', 'bronze'),
      psAchievement('ps-ds-09', 'One of the Few', 'Help a player vanquish a boss.', 'silver'),
      psAchievement('ps-ds-10', 'King of Rings', 'Acquire all rings.', 'gold'),
    
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
      psAchievement('ps-hd2-06', 'Promote Synergy', 'Provide assisted reloads 5 times.', 'bronze'),
      psAchievement('ps-hd2-07', 'Hold My Primary, I’m Going In!', 'Complete a Hard difficulty mission or higher without dying.', 'silver'),
      psAchievement('ps-hd2-08', 'Let’s Call It a Draw', 'Shoot both arms off a Hulk and then extract while it is still alive.', 'bronze'),
      psAchievement('ps-hd2-09', 'Caught Them by Supplies!', 'Kill 25 enemies with a Resupply drop.', 'bronze'),
      psAchievement('ps-hd2-10', 'That Which Does Not Kill You…', 'Take damage to all body parts at the same time.', 'bronze'),
    
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
      xboxAchievement('xbox-halo-06', 'Together. Again?', 'Explored the Nexus and retrieved the Weapon.', 10),
      xboxAchievement('xbox-halo-07', 'Pelican Down', 'Shut down the first anti-air cannon and gained access to a Pelican downed near the UNSC Mortal Reverie.', 10),
      xboxAchievement('xbox-halo-08', 'Unearthed', 'Shut down the mining laser and defeated the Banished warlord Chak ‘Lok.', 10),
      xboxAchievement('xbox-halo-09', 'What Will It Take?', 'Completed the sequence in the Command Spire.', 10),
      xboxAchievement('xbox-halo-10', 'Canon Collector', 'Unlocked all UNSC Audio Logs.', 10),
    
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
      xboxAchievement('xbox-fh5-06', 'Mi Casa', 'Unlock the first Player House.', 10),
      xboxAchievement('xbox-fh5-07', 'Icebreaker', 'Participate in your first Horizon Arcade Event.', 10),
      xboxAchievement('xbox-fh5-08', 'Dust in the Lens', 'Take a photo during a dust storm.', 10),
      xboxAchievement('xbox-fh5-09', 'A Heart of Gold', 'Send a Gift Drop to another player.', 10),
      xboxAchievement('xbox-fh5-10', 'Unlimited Prowess!', 'Complete Round Three in all five Horizon Arcade themes.', 20),
    
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
      xboxAchievement('xbox-sot-06', 'Dead Men Tell No Tales', 'Complete a Skeleton Fort.', 20),
      xboxAchievement('xbox-sot-07', 'Merchant of Forsaken Goods', 'Deliver 250 Crates of Cargo.', 30),
      xboxAchievement('xbox-sot-08', 'Hoarder of Treasured Tears', 'Hand in 20 Mermaid Gems to the Gold Hoarders.', 20),
      xboxAchievement('xbox-sot-09', 'Sailor of the Shores of Gold', 'Complete the Shores of Gold Tall Tale.', 30),
      xboxAchievement('xbox-sot-10', 'A Pirate’s Life For Me', 'Reach level 20 in three different Trading Companies.', 30),
    
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
      xboxAchievement('xbox-g5-06', 'Shock and Awe', 'Use Jack’s Flash ability to stun 3 enemies at once.', 5),
      xboxAchievement('xbox-g5-07', 'Good Good Good', 'Use Jack’s Stim upgraded ability to Stim 3 allies at once.', 5),
      xboxAchievement('xbox-g5-08', 'Jacked Up', 'Fully upgrade Jack.', 20),
      xboxAchievement('xbox-g5-09', 'Blood From a Stone', 'Destroy a Revenant in the Riftworm Village.', 10),
      xboxAchievement('xbox-g5-10', 'Brutal Beatdown', 'Kill 100 enemies with melee attacks.', 10),
    
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
      xboxAchievement('xbox-oriw-06', 'Mad Skills', 'Upgrade a skill fully.', 10),
      xboxAchievement('xbox-oriw-07', 'Tools of the Trade', 'Acquire all upgrades from Twillen.', 20),
      xboxAchievement('xbox-oriw-08', 'Shard Hunter', 'Acquire all shards.', 30),
      xboxAchievement('xbox-oriw-09', 'Healthy', 'Reach max life.', 15),
      xboxAchievement('xbox-oriw-10', 'Powerful', 'Reach max energy.', 15),
    
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
      xboxAchievement('xbox-hfr-06', 'Backstage Pass', 'Inspect all the graffiti in the hideout.', 15),
      xboxAchievement('xbox-hfr-07', 'That’s My Jam', 'Collect every music track for the hideout.', 20),
      xboxAchievement('xbox-hfr-08', 'Secret Vandalism', 'Destroy every Smidge graffiti robot.', 20),
      xboxAchievement('xbox-hfr-09', 'Too Big to Fail', 'Complete Track 6.', 15),
      xboxAchievement('xbox-hfr-10', 'I Think I’m Famous Now', 'Complete Track 12.', 15),
    
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
      xboxAchievement('xbox-psy2-06', 'A Little Off the Top', 'Used Clairvoyance on the barber.', 10),
      xboxAchievement('xbox-psy2-07', 'Nest Egg', 'Completely fill your PSI Challenge Marker ranks.', 20),
      xboxAchievement('xbox-psy2-08', 'Making Peace', 'Return all Figments for Cassie’s Collection.', 20),
      xboxAchievement('xbox-psy2-09', 'Tattered Family', 'Collect all Emotional Baggage tags and bags.', 30),
      xboxAchievement('xbox-psy2-10', 'Senior Intern', 'Internship complete.', 30),
    
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
      xboxAchievement('xbox-grounded-06', 'Craftsmith', 'Craft 15 different items.', 10),
      xboxAchievement('xbox-grounded-07', 'Exoskeleton', 'Craft a set of Acorn Armor.', 10),
      xboxAchievement('xbox-grounded-08', 'Mint Condition', 'Craft a Mint Mallet.', 15),
      xboxAchievement('xbox-grounded-09', 'Gotta Peep Them All', 'Peep all creature cards.', 40),
      xboxAchievement('xbox-grounded-10', 'Model Citizen', 'Complete all MIX.R modules in the yard.', 30),
    
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
      xboxAchievement('xbox-pentiment-06', 'Illuminata', 'Painted a masterpiece.', 10),
      xboxAchievement('xbox-pentiment-07', 'A New Perspective', 'Used the printing press in Tassing.', 10),
      xboxAchievement('xbox-pentiment-08', 'Sleepwalking', 'Walked at night and learned a secret.', 10),
      xboxAchievement('xbox-pentiment-09', 'Auld Alliance', 'Finished the game with Andreas and Caspar reconciled.', 20),
      xboxAchievement('xbox-pentiment-10', 'Bibliophile', 'Read every book in the game.', 30),
    
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
      xboxAchievement('xbox-tunic-06', 'Mr Mayor', 'Found and rang both belltowers.', 20),
      xboxAchievement('xbox-tunic-07', 'Ding', 'Found the church bell.', 10),
      xboxAchievement('xbox-tunic-08', 'Bring it to the Wrong Fight II', 'Use a lure to trick an enemy into striking another enemy.', 10),
      xboxAchievement('xbox-tunic-09', 'Sacred Geometry', 'Solve the Cathedral gauntlet.', 20),
      xboxAchievement('xbox-tunic-10', 'Thanks for Playing!', 'Reach one of the game endings.', 20),
    
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
      steamAchievement('steam-hades-06', 'Skelly Slayer', 'Slay Skelly 15 times'),
      steamAchievement('steam-hades-07', 'Well Stocked', 'Buy 9 items from the Well of Charon in a single escape attempt'),
      steamAchievement('steam-hades-08', 'Friends Forever', 'Max any Companion affinity'),
      steamAchievement('steam-hades-09', 'Blood Brothers', 'Max any Weapon Aspect'),
      steamAchievement('steam-hades-10', 'The Useless Trinket', 'Earn the first of Skelly’s prizes'),
    
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
      steamAchievement('steam-portal2-06', 'Bridge Over Troubling Water', 'Complete the first Hard-Light Surfaces test.'),
      steamAchievement('steam-portal2-07', 'SaBOTour', 'Make a break for the sabotage hatch.'),
      steamAchievement('steam-portal2-08', 'Stalemate Associate', 'Press the button!'),
      steamAchievement('steam-portal2-09', 'Tater Tote', 'Carry science forward.'),
      steamAchievement('steam-portal2-10', 'Vertically Unchallenged', 'Master the Propulsion Gel in Repulsion Polarity.'),
    
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
      steamAchievement('steam-celeste-06', 'Forsaken', 'Complete Chapter 8.'),
      steamAchievement('steam-celeste-07', 'Wow', 'Complete Chapter 9.'),
      steamAchievement('steam-celeste-08', 'Strawberry Badge', 'Collect 80 strawberries.'),
      steamAchievement('steam-celeste-09', 'B-Sides', 'Complete all B-Side chapters.'),
      steamAchievement('steam-celeste-10', 'C-Sides', 'Complete all C-Side chapters.'),
    
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
      steamAchievement('steam-hk-06', 'Enchanted', 'Acquire 4 Charms.'),
      steamAchievement('steam-hk-07', 'Masked', 'Acquire 4 Mask Shards.'),
      steamAchievement('steam-hk-08', 'Soulful', 'Acquire 3 Vessel Fragments.'),
      steamAchievement('steam-hk-09', 'Connection', 'Open half of Hallownest’s Stag Stations.'),
      steamAchievement('steam-hk-10', 'Purity', 'Defeat the Nailsmith.'),
    
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
      steamAchievement('steam-vs-06', 'Inlaid Library', 'Reach Level 40 in Inlaid Library.'),
      steamAchievement('steam-vs-07', 'Hyper Mad Forest', 'Defeat the giant Blue Venus in Mad Forest.'),
      steamAchievement('steam-vs-08', 'Garlic', 'Find five Floor Chickens.'),
      steamAchievement('steam-vs-09', 'King Bible', 'Find a Rosary.'),
      steamAchievement('steam-vs-10', 'Dommario', 'Earn 5000 coins in a single run.'),
    
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
      steamAchievement('steam-sts-06', 'Ruby', 'Reach Ascension Level 10.'),
      steamAchievement('steam-sts-07', 'Common Sense', 'Finish a run with a deck containing 5 or fewer cards.'),
      steamAchievement('steam-sts-08', 'Barricaded', 'Have 99 Block during combat.'),
      steamAchievement('steam-sts-09', 'Infinity', 'Play 25 cards in a single turn.'),
      steamAchievement('steam-sts-10', 'Shrug It Off', 'Win a battle with 1 HP remaining.'),
    
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
      steamAchievement('steam-balatro-06', 'Royal', 'Play a Royal Flush.'),
      steamAchievement('steam-balatro-07', 'Heads Up', 'Win a run with a High Card hand.'),
      steamAchievement('steam-balatro-08', 'Tiny Hands', 'Thin your deck down to 20 cards or less.'),
      steamAchievement('steam-balatro-09', 'Big Hands', 'Have 80 or more cards in your deck.'),
      steamAchievement('steam-balatro-10', 'Card Shark', 'Beat a Boss Blind using only one hand.'),
    
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
      steamAchievement('steam-sdv-06', 'Raising Animals', 'Build a Coop.'),
      steamAchievement('steam-sdv-07', 'A Big Help', 'Complete 10 “Help Wanted” requests.'),
      steamAchievement('steam-sdv-08', 'DIY', 'Craft 15 different items.'),
      steamAchievement('steam-sdv-09', 'Homesteader', 'Craft 30 different items.'),
      steamAchievement('steam-sdv-10', 'Ol’ Mariner', 'Catch 24 different fish.'),
    
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
      steamAchievement('steam-dtd-06', 'Undersea Civilization!', 'Meet the Sea People.'),
      steamAchievement('steam-dtd-07', 'Card Collector', 'Collect 50 FishMon cards.'),
      steamAchievement('steam-dtd-08', 'Like a Boss', 'Defeat Klaus.'),
      steamAchievement('steam-dtd-09', 'Seaweed Collector', 'Harvest 20 seaweed.'),
      steamAchievement('steam-dtd-10', 'Curious Diver', 'Discover 5 control room secrets.'),
    
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
      steamAchievement('steam-de-06', 'Modus: Mullen', 'Solve the case.'),
      steamAchievement('steam-de-07', 'Fairweather T-500', 'Play in T-500 mode.'),
      steamAchievement('steam-de-08', 'Vespertine', 'Finish the game at nightfall.'),
      steamAchievement('steam-de-09', 'Avowed Inframaterialist', 'Opt in for every Mazovian socio-economics thought and political action.'),
      steamAchievement('steam-de-10', 'The Most Honourable Cop in the Land', 'Finish the game without taking bribes or stealing.'),
    
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
