/* 전역 firebase */
(function () {
  "use strict";

  const config = window.IDIOM_FIREBASE_CONFIG;
  let app;
  let auth;
  let db;

  function enabled() {
    return Boolean(config && config.apiKey && window.firebase);
  }

  function requireReady() {
    if (!enabled()) throw new Error("Firebase 설정이 아직 연결되지 않았습니다.");
    if (!app) {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
      auth = firebase.auth();
      db = firebase.firestore();
    }
  }

  async function ensureStudentAuth() {
    requireReady();
    if (!auth.currentUser) await auth.signInAnonymously();
    // 익명 로그인 직후에도 Firestore 규칙이 인증 정보를 확인할 수 있게 토큰을 갱신합니다.
    await auth.currentUser.getIdToken(true);
    return auth.currentUser.uid;
  }

  function responsePath(classCode, activityCode, studentNumber) {
    return db.collection("classes").doc(classCode)
      .collection("activities").doc(activityCode)
      .collection("responses").doc(studentNumber);
  }

  async function submitStudentResult(result) {
    const studentUid = await ensureStudentAuth();
    const data = {
      classCode: result.classCode,
      activityCode: result.activityCode,
      studentNumber: result.studentNumber,
      studentUid,
      score: result.score,
      firstAttemptCorrectCount: result.firstAttemptCorrectCount,
      accuracy: result.accuracy,
      averageResponseTimeMs: result.averageResponseTimeMs,
      answers: result.answers,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      clientCompletedAt: result.completedAt
    };
    await responsePath(result.classCode, result.activityCode, result.studentNumber).create(data);
  }

  async function signInTeacher() {
    requireReady();
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    return auth.currentUser;
  }

  async function signOutTeacher() {
    requireReady();
    await auth.signOut();
  }

  async function loadTeacherResults(classCode, activityCode) {
    requireReady();
    const snapshot = await db.collection("classes").doc(classCode)
      .collection("activities").doc(activityCode)
      .collection("responses").get();
    return snapshot.docs.map((document) => document.data());
  }

  window.firebaseStore = {
    get enabled() { return enabled(); },
    get currentUser() { return auth && auth.currentUser; },
    ensureStudentAuth,
    submitStudentResult,
    signInTeacher,
    signOutTeacher,
    loadTeacherResults
  };
}());
