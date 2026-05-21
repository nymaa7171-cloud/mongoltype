import type { Difficulty } from "@/lib/supabase/database.types";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

const wordsByDifficulty: Record<Difficulty, string[]> = {
  easy: [
    "би",
    "чи",
    "гэр",
    "ном",
    "ус",
    "гал",
    "уул",
    "тал",
    "хүн",
    "өдөр",
    "сайн",
    "сур",
    "яв",
    "ир",
    "нэг",
    "хоёр",
    "гурав",
    "өд",
    "үс",
    "ёо"
  ],
  medium: [
    "монгол",
    "кирилл",
    "хурд",
    "дасгал",
    "сүлжээ",
    "түргэн",
    "алдаа",
    "оноо",
    "түвшин",
    "уралдаан",
    "амжилт",
    "хуруу",
    "бичих",
    "сэтгэл",
    "нийслэл",
    "цахим",
    "өгүүлбэр",
    "үйлдэл"
  ],
  hard: [
    "хариуцлага",
    "мэдээллийн",
    "технологи",
    "сонирхолтой",
    "хөдөлмөрч",
    "өрсөлдөөн",
    "гүйцэтгэл",
    "төвлөрөл",
    "нүүдэлчин",
    "боловсрол",
    "найдвартай",
    "түрүүлэх",
    "шинэчлэл",
    "эрчимтэй",
    "бүтээмж"
  ],
  expert: [
    "Өглөөний цэнгэг агаарт төвлөрлөө хадгалж, үсэг бүрийг яг таг дар.",
    "Ёслолын үеэр зөв бичих чадвар хурдтай адил чухал байдаг.",
    "Үүлэн сүлжээнд холбогдсон уралдаан бүр бодит хугацаанд шинэчлэгдэнэ.",
    "Өрсөлдөгчийн явцыг харахдаа өөрийн хэмнэлээ алдахгүй байх нь ур чадвар.",
    "Монгол кирилл гарын байрлалд дасвал урт өгүүлбэр ч саад болохгүй."
  ]
};

export const keyboardRows = [
  ["ф", "ц", "у", "ж", "э", "н", "г", "ш", "ү", "з", "к", "ъ"],
  ["й", "ы", "б", "ө", "а", "х", "р", "о", "л", "д", "п", "е"],
  ["я", "ч", "ё", "с", "м", "и", "т", "ь", "в", "ю", ".", ","]
];

export function normalizeMongolian(input: string) {
  return input.normalize("NFC").replace(/\u180e/g, "").replace(/\r\n/g, "\n");
}

export function splitGlyphs(input: string) {
  return Array.from(normalizeMongolian(input));
}

export function glyphEquals(expected: string, actual: string) {
  return normalizeMongolian(expected) === normalizeMongolian(actual);
}

export function generateMongolianPrompt(difficulty: Difficulty = "medium", targetWords = 32) {
  if (difficulty === "expert") {
    return wordsByDifficulty.expert
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join(" ");
  }

  const source = wordsByDifficulty[difficulty];
  const words = Array.from({ length: targetWords }, (_, index) => {
    const next = source[Math.floor(Math.random() * source.length)];
    if (difficulty === "hard" && index > 0 && index % 11 === 0) {
      return `${next},`;
    }

    return next;
  });

  return words.join(" ");
}

export function difficultyLabel(difficulty: Difficulty) {
  const labels: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    expert: "Expert"
  };

  return labels[difficulty];
}
