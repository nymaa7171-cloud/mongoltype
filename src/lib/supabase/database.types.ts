export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RaceStatus = "waiting" | "countdown" | "live" | "finished" | "cancelled";
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          level: number;
          xp: number;
          title: string;
          profile_glow: string;
          current_streak: number;
          longest_streak: number;
          best_wpm: number;
          best_accuracy: number;
          races_won: number;
          races_played: number;
          words_typed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          username: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      races: {
        Row: {
          id: string;
          room_code: string;
          host_id: string;
          prompt: string;
          difficulty: Difficulty;
          status: RaceStatus;
          countdown_started_at: string | null;
          started_at: string | null;
          finished_at: string | null;
          winner_id: string | null;
          max_players: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["races"]["Row"]> & {
          room_code: string;
          host_id: string;
          prompt: string;
        };
        Update: Partial<Database["public"]["Tables"]["races"]["Row"]>;
      };
      race_players: {
        Row: {
          id: string;
          race_id: string;
          user_id: string;
          username: string;
          avatar_url: string | null;
          ready: boolean;
          progress: number;
          wpm: number;
          accuracy: number;
          rank: number | null;
          finished_at: string | null;
          combo: number;
          updated_at: string;
          joined_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["race_players"]["Row"]> & {
          race_id: string;
          user_id: string;
          username: string;
        };
        Update: Partial<Database["public"]["Tables"]["race_players"]["Row"]>;
      };
      typing_stats: {
        Row: {
          id: string;
          user_id: string;
          race_id: string | null;
          prompt: string;
          difficulty: Difficulty;
          wpm: number;
          accuracy: number;
          words_typed: number;
          mistakes: number;
          xp_earned: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["typing_stats"]["Row"]> & {
          user_id: string;
          prompt: string;
          difficulty: Difficulty;
          wpm: number;
          accuracy: number;
          words_typed: number;
          mistakes: number;
          xp_earned: number;
        };
        Update: Partial<Database["public"]["Tables"]["typing_stats"]["Row"]>;
      };
      achievements: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          xp_reward: number;
          icon: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]> & {
          slug: string;
          name: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]> & {
          user_id: string;
          achievement_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]>;
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_key: string;
          title: string;
          target: number;
          progress: number;
          xp_reward: number;
          completed: boolean;
          mission_date: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_missions"]["Row"]> & {
          user_id: string;
          mission_key: string;
          title: string;
          target: number;
          mission_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_missions"]["Row"]>;
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          avatar_url: string | null;
          highest_wpm: number;
          highest_accuracy: number;
          highest_level: number;
          longest_streak: number;
          races_won: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leaderboard"]["Row"]> & {
          user_id: string;
          username: string;
        };
        Update: Partial<Database["public"]["Tables"]["leaderboard"]["Row"]>;
      };
      match_history: {
        Row: {
          id: string;
          user_id: string;
          race_id: string;
          placement: number;
          wpm: number;
          accuracy: number;
          xp_earned: number;
          result: "win" | "podium" | "finished";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["match_history"]["Row"]> & {
          user_id: string;
          race_id: string;
          placement: number;
          wpm: number;
          accuracy: number;
          xp_earned: number;
          result: "win" | "podium" | "finished";
        };
        Update: Partial<Database["public"]["Tables"]["match_history"]["Row"]>;
      };
    };
    Functions: {
      complete_race_result: {
        Args: {
          race_id_input: string;
          user_id_input: string;
          placement_input: number;
          wpm_input: number;
          accuracy_input: number;
          words_typed_input: number;
          mistakes_input: number;
          xp_input: number;
        };
        Returns: undefined;
      };
      seed_daily_missions: {
        Args: {
          user_id_input: string;
        };
        Returns: undefined;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Race = Database["public"]["Tables"]["races"]["Row"];
export type RacePlayer = Database["public"]["Tables"]["race_players"]["Row"];
export type LeaderboardRow = Database["public"]["Tables"]["leaderboard"]["Row"];
export type Mission = Database["public"]["Tables"]["daily_missions"]["Row"];
