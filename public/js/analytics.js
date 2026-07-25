export function mean(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function formatSeconds(milliseconds) {
  return `${(Number(milliseconds || 0) / 1000).toFixed(1)}초`;
}

function validAnswer(answer) {
  return (
    answer &&
    typeof answer.questionId === "string" &&
    typeof answer.firstChoiceId === "string" &&
    typeof answer.firstCorrect === "boolean" &&
    Number.isFinite(answer.firstResponseMs) &&
    answer.firstResponseMs >= 0
  );
}

export function analyzeResponses(activity, responses) {
  const safeResponses = responses.filter(
    (response) => response && Array.isArray(response.answers)
  );
  let totalAnswers = 0;
  let totalCorrect = 0;

  const questionStats = activity.questions.map((question, index) => {
    const answers = safeResponses
      .map((response) => response.answers.find((answer) => answer.questionId === question.id))
      .filter(validAnswer);
    const correctCount = answers.filter((answer) => answer.firstCorrect).length;
    const responseTimes = answers.map((answer) => answer.firstResponseMs);
    const choiceCounts = Object.fromEntries(
      question.options.map((option) => [option.id, 0])
    );

    for (const answer of answers) {
      if (Object.hasOwn(choiceCounts, answer.firstChoiceId)) {
        choiceCounts[answer.firstChoiceId] += 1;
      }
    }

    totalAnswers += answers.length;
    totalCorrect += correctCount;
    const accuracy = answers.length ? (correctCount / answers.length) * 100 : 0;

    return {
      questionId: question.id,
      questionNumber: index + 1,
      prompt: question.prompt,
      responseCount: answers.length,
      correctCount,
      accuracy,
      averageResponseMs: mean(responseTimes),
      medianResponseMs: median(responseTimes),
      choiceCounts,
      isWeak:
        answers.length >= activity.minimumWeaknessSample &&
        accuracy < activity.weaknessThreshold
    };
  });

  return {
    participantCount: safeResponses.length,
    totalAnswers,
    totalCorrect,
    overallAccuracy: totalAnswers ? (totalCorrect / totalAnswers) * 100 : 0,
    questionStats,
    weakQuestions: questionStats.filter((question) => question.isWeak)
  };
}

export function analyzeStudent(activity, response) {
  const answers = Array.isArray(response?.answers) ? response.answers : [];
  const rows = activity.questions.map((question, index) => {
    const answer = answers.find((item) => item.questionId === question.id);
    const firstOption = question.options.find(
      (option) => option.id === answer?.firstChoiceId
    );
    return {
      questionNumber: index + 1,
      prompt: question.prompt,
      firstChoiceText: firstOption?.text ?? "응답 없음",
      firstCorrect: answer?.firstCorrect === true,
      firstResponseMs: Number(answer?.firstResponseMs) || 0,
      attemptCount: Number(answer?.attemptCount) || 0
    };
  });
  const answeredRows = rows.filter((row) => row.firstChoiceText !== "응답 없음");
  const correctCount = answeredRows.filter((row) => row.firstCorrect).length;

  return {
    studentNumber: String(response?.studentNumber ?? ""),
    questionCount: activity.questions.length,
    correctCount,
    accuracy: answeredRows.length ? (correctCount / answeredRows.length) * 100 : 0,
    averageResponseMs: mean(answeredRows.map((row) => row.firstResponseMs)),
    rows
  };
}

