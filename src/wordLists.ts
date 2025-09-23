import { DetectionCategory } from "./types";

/**
 * Built-in detection categories with curated word lists
 */
export const DETECTION_CATEGORIES: Record<string, DetectionCategory> = {
  profanity: {
    name: "profanity",
    severity: "medium",
    description: "General profanity and offensive language",
    keywords: [
      "fuck",
      "fucking",
      "fucked",
      "fucker",
      "fuckers",
      "shit",
      "shitting",
      "shitty",
      "shits",
      "damn",
      "damned",
      "dammit",
      "damning",
      "hell",
      "hellish",
      "bitch",
      "bitching",
      "bitches",
      "bitchy",
      "ass",
      "asses",
      "asshole",
      "assholes",
      "bastard",
      "bastards",
      "crap",
      "crappy",
      "crapping",
      "piss",
      "pissed",
      "pissing",
      "cock",
      "cocks",
      "dick",
      "dicks",
      "dickhead",
      "pussy",
      "pussies",
      "slut",
      "sluts",
      "slutty",
      "whore",
      "whores",
      "motherfucker",
      "motherfuckers",
      "motherfucking",
      "bullshit",
      "goddamn",
      "goddamned",
      "jackass",
      "prick",
      "twat",
      "cunt",
      "fag",
      "retard",
    ],
  },

  explicit: {
    name: "explicit",
    severity: "high",
    description: "Sexually explicit and adult content",
    keywords: [
      "nude",
      "naked",
      "nsfw",
      "explicit",
      "sex",
      "porn",
      "adult",
      "erotic",
      "sexual",
      "xxx",
      "seductive",
      "revealing",
      "topless",
      "underwear",
      "lingerie",
      "bikini",
      "exposed",
      "intimate",
      "masturbation",
      "orgasm",
      "penetration",
      "breast",
      "nipple",
      "vagina",
      "penis",
      "genital",
      "horny",
      "aroused",
      "climax",
      "fetish",
      "kinky",
      "submissive",
      "dominant",
      "bondage",
    ],
  },

  violence: {
    name: "violence",
    severity: "high",
    description: "Violent and harmful content",
    keywords: [
      "kill",
      "murder",
      "death",
      "blood",
      "gore",
      "violence",
      "torture",
      "weapon",
      "gun",
      "knife",
      "bomb",
      "terrorist",
      "suicide",
      "harm",
      "hurt",
      "abuse",
      "assault",
      "attack",
      "destroy",
      "massacre",
      "slaughter",
      "execute",
      "assassinate",
      "strangle",
      "stab",
      "shoot",
      "poison",
      "explosive",
      "warfare",
    ],
  },

  drugs: {
    name: "drugs",
    severity: "medium",
    description: "Drug-related content",
    keywords: [
      "cocaine",
      "heroin",
      "meth",
      "marijuana",
      "weed",
      "cannabis",
      "lsd",
      "ecstasy",
      "molly",
      "crack",
      "opium",
      "morphine",
      "fentanyl",
      "amphetamine",
      "psychedelic",
      "hallucinogen",
      "drug dealer",
      "drug lord",
      "narcotic",
      "overdose",
      "addiction",
    ],
  },

  hate: {
    name: "hate",
    severity: "high",
    description: "Hate speech and discriminatory content",
    keywords: [
      "nazi",
      "hitler",
      "holocaust",
      "genocide",
      "supremacist",
      "racist",
      "racism",
      "sexist",
      "homophobic",
      "transphobic",
      "bigot",
      "discrimination",
      "prejudice",
      "slur",
      "ethnic cleansing",
    ],
  },

  self_harm: {
    name: "self_harm",
    severity: "high",
    description: "Self-harm and suicide-related content",
    keywords: [
      "suicide",
      "self-harm",
      "cut myself",
      "kill myself",
      "end my life",
      "suicidal",
      "depression",
      "cutting",
      "self-injury",
      "overdose",
      "hanging",
      "jumping",
      "self-destruction",
      "self-mutilation",
    ],
  },
};

/**
 * Get all keywords from all categories
 */
export const getAllKeywords = (): string[] => {
  const allKeywords: string[] = [];
  Object.values(DETECTION_CATEGORIES).forEach((category) => {
    allKeywords.push(...category.keywords);
  });
  return [...new Set(allKeywords)]; // Remove duplicates
};

/**
 * Get keywords by category
 */
export const getKeywordsByCategory = (categoryName: string): string[] => {
  return DETECTION_CATEGORIES[categoryName]?.keywords || [];
};

/**
 * Get all category names
 */
export const getCategoryNames = (): string[] => {
  return Object.keys(DETECTION_CATEGORIES);
};
