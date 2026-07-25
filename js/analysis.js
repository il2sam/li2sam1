// 문항이 바뀐 이전 결과와 섞이지 않도록 새 저장 공간을 사용합니다.
const STORAGE_KEY = "idiomQuizResultsV2";

function loadResults() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveResult(result) {
  const results = loadResults();
  const index = results.findIndex((item) => item.studentNumber === result.studentNumber);
  if (index >= 0) results[index] = result;
  else results.push(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function seconds(milliseconds) { return `${(Number(milliseconds || 0) / 1000).toFixed(1)}초`; }
function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function analyzeClass(results) {
  const participantCount = results.length;
  const allAnswers = results.flatMap((result) => result.answers || []);
  const averageScore = participantCount ? results.reduce((sum, result) => sum + result.score, 0) / participantCount : 0;
  const accuracy = allAnswers.length ? allAnswers.filter((answer) => answer.firstAttemptCorrect).length / allAnswers.length * 100 : 0;
  const averageTime = allAnswers.length ? allAnswers.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / allAnswers.length : 0;
  const questionStats = questions.map((question) => {
    const answers = allAnswers.filter((answer) => answer.questionNumber === question.id);
    const correct = answers.filter((answer) => answer.firstAttemptCorrect).length;
    const times = answers.map((answer) => answer.responseTimeMs);
    const distribution = Object.fromEntries(question.options.map((option) => [option, 0]));
    answers.forEach((answer) => { if (Object.hasOwn(distribution, answer.firstChoice)) distribution[answer.firstChoice] += 1; });
    return { question, answered: answers.length, correct, accuracy: answers.length ? correct / answers.length * 100 : 0, averageTime: times.length ? times.reduce((sum, time) => sum + time, 0) / times.length : 0, medianTime: median(times), distribution };
  });
  const lowestAccuracy = questionStats.filter((stat) => stat.answered).sort((a, b) => a.accuracy - b.accuracy)[0];
  const longestTime = questionStats.filter((stat) => stat.answered).sort((a, b) => b.averageTime - a.averageTime)[0];
  return { participantCount, averageScore, accuracy, averageTime, questionStats, lowestAccuracy, longestTime };
}

function toCsv(rows) { return rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n"); }
function downloadCsv(filename, content) { const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
async function copyText(text) { if (navigator.clipboard) await navigator.clipboard.writeText(text); else window.prompt("아래 내용을 복사하세요.", text); }
