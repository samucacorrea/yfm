import { cards, getCard as getLocalCard } from "./catalog";
import { duelists, getDuelist as getLocalDuelist } from "./portal-content";
import { getWordPressCard, getWordPressCards, getWordPressDuelist, getWordPressDuelists, getWordPressMod, getWordPressMods } from "./wordpress-data";

let cardsRequest: ReturnType<typeof getWordPressCards> | undefined;
let duelistsRequest: ReturnType<typeof getWordPressDuelists> | undefined;
let modsRequest: ReturnType<typeof getWordPressMods> | undefined;
let cardsExpiresAt = 0;
let duelistsExpiresAt = 0;
let modsExpiresAt = 0;
const DATA_CACHE_TTL = 5 * 60 * 1000;

export async function getCards() {
  try {
    if (!cardsRequest || Date.now() >= cardsExpiresAt) {
      cardsRequest = getWordPressCards();
      cardsExpiresAt = Date.now() + DATA_CACHE_TTL;
    }
    const remote = await cardsRequest;
    return remote.length ? remote : cards;
  } catch {
    cardsRequest = undefined;
    cardsExpiresAt = 0;
    return cards;
  }
}

export async function getCard(slug: string) {
  try {
    return await getWordPressCard(slug);
  } catch {
    return getLocalCard(slug);
  }
}

export async function getDuelists() {
  try {
    if (!duelistsRequest || Date.now() >= duelistsExpiresAt) {
      duelistsRequest = getWordPressDuelists();
      duelistsExpiresAt = Date.now() + DATA_CACHE_TTL;
    }
    const remote = await duelistsRequest;
    return remote.length ? remote : duelists;
  } catch {
    duelistsRequest = undefined;
    duelistsExpiresAt = 0;
    return duelists;
  }
}

export async function getDuelist(slug: string) {
  try {
    return await getWordPressDuelist(slug);
  } catch {
    return getLocalDuelist(slug);
  }
}

export async function getMods() {
  try {
    if (!modsRequest || Date.now() >= modsExpiresAt) {
      modsRequest = getWordPressMods();
      modsExpiresAt = Date.now() + DATA_CACHE_TTL;
    }
    const remote = await modsRequest;
    return remote;
  } catch {
    modsRequest = undefined;
    modsExpiresAt = 0;
    return [];
  }
}

export async function getMod(slug: string) {
  try {
    return await getWordPressMod(slug);
  } catch {
    return undefined;
  }
}
