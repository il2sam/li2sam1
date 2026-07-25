function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function rowsToCsv(rows) {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

export function overallCsvRows(activity, analysis) {
  const optionHeaders = activity.questions[0].options.map(
    (_, index) => `선택지 ${index + 1}`
  );
  const rows = [
    [
      "문항",
      "응답 수",
      "첫 응답 정답 수",
      "첫 응답 정답률(%)",
      "평균 응답 시간(초)",
      "중앙값 응답 시간(초)",
      "취약 문항",
      ...optionHeaders
    ]
  ];

  for (const stat of analysis.questionStats) {
    const question = activity.questions[stat.questionNumber - 1];
    rows.push([
      stat.questionNumber,
      stat.responseCount,
      stat.correctCount,
      stat.accuracy.toFixed(1),
      (stat.averageResponseMs / 1000).toFixed(1),
      (stat.medianResponseMs / 1000).toFixed(1),
      stat.isWeak ? "예" : "아니요",
      ...question.options.map(
        (option) => `${option.text}: ${stat.choiceCounts[option.id] ?? 0}명`
      )
    ]);
  }
  return rows;
}

export function studentCsvRows(studentAnalysis) {
  return [
    ["학생 번호", studentAnalysis.studentNumber],
    ["첫 응답 정답률(%)", studentAnalysis.accuracy.toFixed(1)],
    ["평균 응답 시간(초)", (studentAnalysis.averageResponseMs / 1000).toFixed(1)],
    [],
    ["문항", "첫 선택", "첫 응답 결과", "응답 시간(초)", "총 시도 횟수"],
    ...studentAnalysis.rows.map((row) => [
      row.questionNumber,
      row.firstChoiceText,
      row.firstCorrect ? "정답" : "오답",
      (row.firstResponseMs / 1000).toFixed(1),
      row.attemptCount
    ])
  ];
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([`\uFEFF${csvText}`], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function tableToTsv(table) {
  return [...table.rows]
    .map((row) =>
      [...row.cells]
        .map((cell) => cell.innerText.replace(/\s+/g, " ").trim())
        .join("\t")
    )
    .join("\n");
}

