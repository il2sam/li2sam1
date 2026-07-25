function shuffleItems(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function clampResponseTime(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(value), 0), 60 * 60 * 1000);
}

export class QuizSession {
  constructor(activity, random = Math.random) {
    if (!activity?.questions?.length) {
      throw new Error("문항이 한 개 이상 필요합니다.");
    }

    this.activity = activity;
    this.random = random;
    this.currentIndex = 0;
    this.visibleAt = null;
    this.completed = false;
    this.records = activity.questions.map((question) => ({
      questionId: question.id,
      firstChoiceId: null,
      firstCorrect: null,
      firstResponseMs: null,
      attemptCount: 0,
      solved: false,
      optionOrder: shuffleItems(
        question.options.map((option) => option.id),
        this.random
      )
    }));
  }

  get currentQuestion() {
    return this.activity.questions[this.currentIndex];
  }

  get currentRecord() {
    return this.records[this.currentIndex];
  }

  markQuestionVisible(now = performance.now()) {
    if (this.currentRecord.solved) {
      return;
    }
    this.visibleAt = Number(now);
  }

  getOrderedOptions() {
    const optionMap = new Map(
      this.currentQuestion.options.map((option) => [option.id, option])
    );
    return this.currentRecord.optionOrder.map((optionId) => optionMap.get(optionId));
  }

  select(choiceId, now = performance.now()) {
    if (this.completed || this.currentRecord.solved) {
      throw new Error("현재 문항은 이미 완료되었습니다.");
    }
    if (this.visibleAt === null) {
      throw new Error("문항 표시 시간이 기록되지 않았습니다.");
    }

    const selectedOption = this.currentQuestion.options.find(
      (option) => option.id === choiceId
    );
    if (!selectedOption) {
      throw new Error("존재하지 않는 선택지입니다.");
    }

    const record = this.currentRecord;
    const isCorrect = choiceId === this.currentQuestion.answerId;
    record.attemptCount += 1;

    if (record.firstChoiceId === null) {
      record.firstChoiceId = choiceId;
      record.firstCorrect = isCorrect;
      record.firstResponseMs = clampResponseTime(Number(now) - this.visibleAt);
    }

    if (isCorrect) {
      record.solved = true;
    }

    return {
      isCorrect,
      isFirst: record.attemptCount === 1,
      explanation: this.currentQuestion.explanation
    };
  }

  next() {
    if (!this.currentRecord.solved) {
      throw new Error("정답을 찾아야 다음 문항으로 이동할 수 있습니다.");
    }

    if (this.currentIndex === this.activity.questions.length - 1) {
      this.completed = true;
      return false;
    }

    this.currentIndex += 1;
    this.visibleAt = null;
    return true;
  }

  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.activity.questions.length,
      percent: Math.round(
        ((this.currentIndex + (this.currentRecord.solved ? 1 : 0)) /
          this.activity.questions.length) *
          100
      )
    };
  }

  getSummary() {
    const answered = this.records.filter((record) => record.firstCorrect !== null);
    const firstCorrectCount = answered.filter((record) => record.firstCorrect).length;
    const averageResponseMs = answered.length
      ? Math.round(
          answered.reduce((total, record) => total + record.firstResponseMs, 0) /
            answered.length
        )
      : 0;

    return {
      questionCount: this.activity.questions.length,
      answeredCount: answered.length,
      firstCorrectCount,
      firstAccuracy:
        answered.length === 0
          ? 0
          : Math.round((firstCorrectCount / answered.length) * 1000) / 10,
      averageResponseMs
    };
  }

  toSubmission() {
    if (!this.completed) {
      throw new Error("모든 문항을 해결한 뒤 제출할 수 있습니다.");
    }

    return {
      answers: this.records.map(
        ({
          questionId,
          firstChoiceId,
          firstCorrect,
          firstResponseMs,
          attemptCount
        }) => ({
          questionId,
          firstChoiceId,
          firstCorrect,
          firstResponseMs,
          attemptCount
        })
      ),
      summary: this.getSummary()
    };
  }
}

export { shuffleItems, clampResponseTime };

