export interface AchievementDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    slug: "first-win",
    name: "First Win",
    description: "Win your first realtime race.",
    icon: "Trophy",
    xpReward: 250
  },
  {
    slug: "one-thousand-words",
    name: "1000 Words Typed",
    description: "Type 1000 Mongolian words across races and drills.",
    icon: "Keyboard",
    xpReward: 500
  },
  {
    slug: "one-twenty-wpm",
    name: "120 WPM",
    description: "Reach 120 WPM in a completed challenge.",
    icon: "Zap",
    xpReward: 800
  },
  {
    slug: "perfect-accuracy",
    name: "Perfect Accuracy",
    description: "Finish a prompt with 100% accuracy.",
    icon: "BadgeCheck",
    xpReward: 450
  },
  {
    slug: "ten-win-streak",
    name: "10 Win Streak",
    description: "Win 10 races without breaking your streak.",
    icon: "Flame",
    xpReward: 1200
  }
];
