const BEST_SCORE_NAME = "BEST_SCORE";

export const BestScore = {
  get() {
    return +(localStorage.getItem(BEST_SCORE_NAME) ?? 0);
  },
  checkAndSave(score: number) {
    if (score > this.get()) {
      localStorage.setItem(BEST_SCORE_NAME, `${score}`);
    }
  },
};
