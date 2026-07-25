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

  function isGoogleTeacherSignedIn() {
    return Boolean(auth && auth.currentUser && auth.currentUser.providerData.some((provider) => provider.providerId === "google.com"));
  }

  async function signInTeacher() {
    requireReady();
    if (isGoogleTeacherSignedIn()) return auth.currentUser;
    const provider = new firebase.auth.GoogleAuthProvider();
    // 팝업이 차단될 수 있는 학교용 브라우저에서도 작동하도록 로그인 뒤 원래 페이지로 돌아오는 방식을 사용합니다.
    await auth.signInWithRedirect(provider);
    return null;
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
    get isGoogleTeacherSignedIn() { return isGoogleTeacherSignedIn(); },
    ensureStudentAuth,
    submitStudentResult,
    signInTeacher,
    signOutTeacher,
    loadTeacherResults
  };
}());
