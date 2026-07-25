import { cp, mkdir } from "node:fs/promises";

// Vercel에는 학생용 최신 화면에 필요한 파일만 별도 배포 폴더로 복사합니다.
const outputDirectory = "dist";
const deploymentTargets = ["index.html", "css", "js"];

await mkdir(outputDirectory, { recursive: true });

for (const target of deploymentTargets) {
  await cp(target, `${outputDirectory}/${target}`, { recursive: true });
}

console.log("학생용 웹앱 배포 파일을 준비했습니다.");
