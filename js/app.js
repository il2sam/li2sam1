const $ = (selector) => document.querySelector(selector);
const screens = { start: $("#start-screen"), quiz: $("#quiz-screen"), result: $("#result-screen"), teacher: $("#teacher-screen") };
let studentNumber = "";
let classCode = "";
let activityCode = "";
let questionIndex = 0;
let questionStartedAt = 0;
let answers = [];
let choices = [];
let overwriteApproved = false;

function show(name) { Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; }); window.scrollTo(0, 0); }
function setText(selector, text) { $(selector).textContent = text; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function validCode(value) { return /^[A-Za-z0-9_-]{2,20}$/.test(value); }

function startQuiz() {
  classCode = $("#class-code").value.trim();
  activityCode = $("#activity-code").value.trim();
  studentNumber = $("#student-number").value.trim();
  const error = $("#start-error");
  if (!validCode(classCode) || !validCode(activityCode)) { error.textContent = "학급 코드와 활동 코드는 영문, 숫자, - 또는 _로 2~20자 입력해 주세요."; return; }
  if (!/^\d{1,4}$/.test(studentNumber)) { error.textContent = "학생 번호는 1~4자리 숫자로 입력해 주세요."; return; }
  const exists = loadResults().some((item) => item.classCode === classCode && item.activityCode === activityCode && item.studentNumber === studentNumber);
  if (exists && !window.confirm(`이미 ${studentNumber}번의 기록이 있습니다. 다시 진행하시겠습니까?`)) { error.textContent = "기존 기록을 유지했습니다."; return; }
  overwriteApproved = exists;
  error.textContent = "";
  questionIndex = 0; answers = []; renderQuestion(); show("quiz");
}

function renderQuestion() {
  const question = questions[questionIndex];
  choices = shuffle(question.options);
  setText("#progress-text", `${questionIndex + 1} / ${questions.length}`);
  $("#progress-bar").style.width = `${(questionIndex / questions.length) * 100}%`;
  setText("#question-label", `문항 ${questionIndex + 1}`); setText("#question-prompt", question.prompt); setText("#question-situation", question.situation);
  $("#feedback").textContent = ""; $("#feedback").className = "feedback"; $("#next-button").hidden = true;
  const choicesBox = $("#choices"); choicesBox.replaceChildren();
  choices.forEach((choice, index) => {
    const button = document.createElement("button"); const number = document.createElement("span"); const label = document.createElement("span");
    button.type = "button"; button.className = "choice-button"; button.dataset.choice = choice;
    number.className = "choice-number"; number.textContent = String(index + 1); label.className = "choice-label"; label.textContent = choice;
    button.append(number, label); button.addEventListener("click", () => choose(choice, button)); choicesBox.append(button);
  });
  requestAnimationFrame(() => { questionStartedAt = performance.now(); });
}

function choose(choice, button) {
  const question = questions[questionIndex]; const existing = answers[questionIndex]; const first = !existing; const correct = choice === question.answer;
  button.classList.add("selected");
  if (first) answers[questionIndex] = { questionNumber: question.id, firstChoice: choice, correctAnswer: question.answer, firstAttemptCorrect: correct, responseTimeMs: Math.max(0, Math.round(performance.now() - questionStartedAt)), attemptCount: 1 };
  else existing.attemptCount += 1;
  const feedback = $("#feedback");
  if (!correct) { button.disabled = true; button.classList.add("wrong"); feedback.textContent = first ? "첫 응답은 오답으로 기록했습니다. 문장을 다시 살펴보고 정답을 찾아보세요." : "다시 생각해 보세요. 문장의 상황을 떠올려 보세요."; feedback.className = "feedback bad"; return; }
  document.querySelectorAll(".choice-button").forEach((item) => { item.disabled = true; if (item.dataset.choice === question.answer) item.classList.add("correct"); });
  feedback.textContent = first ? `첫 응답도 맞았어요! ${question.explanation}` : `정답을 찾았어요. 첫 응답 결과는 오답으로 기록됩니다. ${question.explanation}`;
  feedback.className = "feedback good"; $("#next-button").hidden = false;
}

async function finishQuiz() {
  const firstAttemptCorrectCount = answers.filter((answer) => answer.firstAttemptCorrect).length;
  const result = { classCode, activityCode, studentNumber, completedAt: new Date().toISOString(), score: firstAttemptCorrectCount * 20, firstAttemptCorrectCount, accuracy: firstAttemptCorrectCount / questions.length * 100, averageResponseTimeMs: answers.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / answers.length, answers };
  const exists = loadResults().some((item) => item.classCode === classCode && item.activityCode === activityCode && item.studentNumber === studentNumber);
  if (!exists || overwriteApproved) saveResult(result);
  renderStudentResult(result); show("result");
  setText("#save-message", "이 기기의 브라우저에 결과가 저장되었습니다.");
  if (!firebaseStore.enabled) { setText("#save-message", "이 기기의 브라우저에 결과가 저장되었습니다. Firebase 연결을 준비 중입니다."); return; }
  try {
    await firebaseStore.submitStudentResult(result);
    setText("#save-message", "결과가 이 기기와 Firebase에 안전하게 저장되었습니다.");
  } catch (error) {
    console.warn("Firebase 저장 실패", error);
    setText("#save-message", "이 기기에 결과를 저장했습니다. Firebase 저장은 완료되지 않았습니다.");
  }
}

function renderStudentResult(result) {
  setText("#score-value", `${result.score}점`); setText("#correct-count-value", `${result.firstAttemptCorrectCount} / ${questions.length}`); setText("#accuracy-value", `${result.accuracy.toFixed(0)}%`); setText("#average-time-value", seconds(result.averageResponseTimeMs));
  $("#student-result-table tbody").innerHTML = result.answers.map((answer) => `<tr><td>${answer.questionNumber}</td><td>${escapeHtml(answer.firstChoice)}</td><td>${escapeHtml(answer.correctAnswer)}</td><td>${answer.firstAttemptCorrect ? "정답" : "오답"}</td><td>${seconds(answer.responseTimeMs)}</td></tr>`).join("");
  $("#review-list").innerHTML = questions.map((question) => `<details class="review-item"><summary>${question.id}번 문항과 해설 보기</summary><p><strong>정답:</strong> ${escapeHtml(question.answer)}</p><p>${escapeHtml(question.explanation)}</p></details>`).join("");
  $("#student-csv-button").onclick = () => downloadCsv(`관용표현_${result.studentNumber}번_결과.csv`, studentCsv(result));
  $("#student-copy-button").onclick = () => copyText(studentCsv(result).replaceAll(",", "\t"));
}

function studentCsv(result) { return toCsv([["학급 코드", result.classCode], ["활동 코드", result.activityCode], ["학생 번호", result.studentNumber], ["점수", result.score], ["첫 응답 정답률", `${result.accuracy}%`], ["평균 첫 응답 시간", seconds(result.averageResponseTimeMs)], [], ["문항", "첫 선택", "정답", "첫 응답 결과", "응답 시간", "시도 횟수"], ...result.answers.map((answer) => [answer.questionNumber, answer.firstChoice, answer.correctAnswer, answer.firstAttemptCorrect ? "정답" : "오답", seconds(answer.responseTimeMs), answer.attemptCount])]); }

function presentTeacherResults(results) {
  results = results.sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber));
  $("#teacher-empty").hidden = results.length > 0; $("#teacher-content").hidden = results.length === 0;
  if (!results.length) return;
  const select = $("#student-select"); select.innerHTML = `<option value="">학생 번호를 선택하세요.</option>${results.map((result) => `<option value="${escapeHtml(result.studentNumber)}">${escapeHtml(result.studentNumber)}번</option>`).join("")}`;
  select.onchange = () => renderTeacherStudent(results.find((result) => result.studentNumber === select.value));
  const analysis = analyzeClass(results); renderClassAnalysis(analysis);
}

function openTeacher() {
  $("#teacher-class-code").value = $("#class-code").value.trim(); $("#teacher-activity-code").value = $("#activity-code").value.trim();
  if (firebaseStore.enabled && firebaseStore.isGoogleTeacherSignedIn) setText("#teacher-auth-status", `${firebaseStore.currentUser.email} 계정으로 로그인했습니다.`);
  presentTeacherResults(loadResults()); show("teacher");
}

function renderClassAnalysis(analysis) {
  setText("#participant-value", `${analysis.participantCount}명`); setText("#class-score-value", `${analysis.averageScore.toFixed(1)}점`); setText("#class-accuracy-value", `${analysis.accuracy.toFixed(1)}%`); setText("#class-time-value", seconds(analysis.averageTime));
  const flags = [];
  if (analysis.lowestAccuracy) flags.push(`<div class="flag">정답률이 가장 낮은 문항: ${analysis.lowestAccuracy.question.id}번 (${analysis.lowestAccuracy.accuracy.toFixed(1)}%)</div>`);
  if (analysis.longestTime) flags.push(`<div class="flag">평균 응답 시간이 가장 긴 문항: ${analysis.longestTime.question.id}번 (${seconds(analysis.longestTime.averageTime)})</div>`);
  $("#flags-list").innerHTML = flags.join("");
  $("#question-analysis-table tbody").innerHTML = analysis.questionStats.map((stat) => `<tr><td>${stat.question.id}번</td><td>${stat.correct} / ${stat.answered}</td><td>${stat.accuracy.toFixed(1)}%</td><td>${seconds(stat.averageTime)}</td><td>${seconds(stat.medianTime)}</td><td><div class="choice-distribution">${stat.question.options.map((option) => `<span><b>${escapeHtml(option)}</b>: ${stat.distribution[option]}명 (${stat.answered ? (stat.distribution[option] / stat.answered * 100).toFixed(1) : 0}%)</span>`).join("")}</div></td></tr>`).join("");
  $("#teacher-csv-button").onclick = () => downloadCsv("관용표현_전체분석.csv", classCsv(analysis)); $("#teacher-copy-button").onclick = () => copyText(classCsv(analysis).replaceAll(",", "\t"));
}

function renderTeacherStudent(result) { const section = $("#selected-student-section"); section.hidden = !result; if (!result) return; setText("#selected-student-number", result.studentNumber); $("#teacher-student-table tbody").innerHTML = result.answers.map((answer) => `<tr><td>${answer.questionNumber}</td><td>${escapeHtml(answer.firstChoice)}</td><td>${answer.firstAttemptCorrect ? "정답" : "오답"}</td><td>${seconds(answer.responseTimeMs)}</td><td>${answer.attemptCount}</td></tr>`).join(""); }
function classCsv(analysis) { return toCsv([["참여 학생 수", analysis.participantCount], ["전체 평균 점수", analysis.averageScore.toFixed(1)], ["전체 첫 응답 정답률", `${analysis.accuracy.toFixed(1)}%`], [], ["문항", "정답 인원", "응답 인원", "정답률", "평균 응답 시간", "중앙값 응답 시간", "선택지 응답 분포"], ...analysis.questionStats.map((stat) => [stat.question.id, stat.correct, stat.answered, `${stat.accuracy.toFixed(1)}%`, seconds(stat.averageTime), seconds(stat.medianTime), stat.question.options.map((option) => `${option}: ${stat.distribution[option]}명`).join(" | ")])]); }

async function loginTeacher() { if (!firebaseStore.enabled) { setText("#teacher-auth-status", "Firebase 환경 변수가 아직 배포되지 않았습니다."); return; } try { const user = await firebaseStore.signInTeacher(); if (user) setText("#teacher-auth-status", `${user.email} 계정으로 로그인했습니다.`); else setText("#teacher-auth-status", "Google 로그인 화면으로 이동합니다. 계정을 선택하면 이 페이지로 돌아옵니다."); } catch (error) { console.warn("Google 로그인 실패", error); setText("#teacher-auth-status", `로그인에 실패했습니다. (${error.code || "알 수 없는 오류"})`); } }
async function loadFirebaseResults() { const requestedClass = $("#teacher-class-code").value.trim(); const requestedActivity = $("#teacher-activity-code").value.trim(); if (!validCode(requestedClass) || !validCode(requestedActivity)) { setText("#teacher-auth-status", "학급 코드와 활동 코드를 확인해 주세요."); return; } if (!firebaseStore.currentUser) { setText("#teacher-auth-status", "먼저 Google 로그인을 해주세요."); return; } try { const results = await firebaseStore.loadTeacherResults(requestedClass, requestedActivity); presentTeacherResults(results); setText("#teacher-auth-status", `${results.length}명의 Firebase 결과를 불러왔습니다.`); } catch (error) { console.warn("교사 결과 조회 실패", error); setText("#teacher-auth-status", "조회 권한이 없습니다. Firestore 교사 권한 설정을 확인해 주세요."); } }

async function restoreTeacherAfterRedirect() {
  if (!firebaseStore.enabled || sessionStorage.getItem("idiomTeacherLoginRequested") !== "true") return;
  await firebaseStore.waitForAuthReady();
  sessionStorage.removeItem("idiomTeacherLoginRequested");
  if (!firebaseStore.isGoogleTeacherSignedIn) return;
  openTeacher();
  setText("#teacher-auth-status", `${firebaseStore.currentUser.email} 계정으로 로그인했습니다.`);
}

$("#start-form").addEventListener("submit", (event) => { event.preventDefault(); startQuiz(); });
$("#next-button").addEventListener("click", () => { if (questionIndex === questions.length - 1) finishQuiz(); else { questionIndex += 1; renderQuestion(); } });
$("#quit-button").addEventListener("click", () => show("start")); $("#restart-button").addEventListener("click", () => show("start")); $("#teacher-open-button").addEventListener("click", openTeacher); $("#teacher-close-button").addEventListener("click", () => show("start"));
$("#student-print-button").addEventListener("click", () => window.print()); $("#teacher-print-button").addEventListener("click", () => window.print()); $("#teacher-login-button").addEventListener("click", loginTeacher); $("#teacher-load-button").addEventListener("click", loadFirebaseResults);
restoreTeacherAfterRedirect();
