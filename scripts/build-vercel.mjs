import { cp, mkdir, writeFile } from "node:fs/promises";

// Vercel에는 학생용 최신 화면에 필요한 파일만 별도 배포 폴더로 복사합니다.
const outputDirectory = "dist";
const deploymentTargets = ["index.html", "css", "js"];

await mkdir(outputDirectory, { recursive: true });

for (const target of deploymentTargets) {
  await cp(target, `${outputDirectory}/${target}`, { recursive: true });
}

// Firebase 웹 설정은 Vercel 환경 변수에서만 배포 산출물에 넣습니다.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
const configured = Object.values(firebaseConfig).slice(0, 6).every(Boolean);
const configSource = configured
  ? `window.IDIOM_FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig)};\n`
  : "// Firebase 환경 변수가 없어 로컬 저장 방식으로 실행합니다.\nwindow.IDIOM_FIREBASE_CONFIG = null;\n";
await writeFile(`${outputDirectory}/js/firebase-config.js`, configSource, "utf8");

console.log("학생용 웹앱 배포 파일을 준비했습니다.");
