export const DEFAULT_ACTIVITY_CODE = "KOR5-WORD-01";

export const activities = {
  [DEFAULT_ACTIVITY_CODE]: {
    code: DEFAULT_ACTIVITY_CODE,
    version: 1,
    title: "우리 학교 작은 숲을 지키는 방법",
    grade: 5,
    subject: "국어",
    weaknessThreshold: 70,
    minimumWeaknessSample: 3,
    passages: [
      {
        heading: "학교 숲 관찰하기",
        paragraphs: [
          "5학년 학생들은 학교 뒤뜰의 작은 숲을 관찰했다. 며칠 동안 비가 오지 않아 흙이 메말라 있었고, 사람들이 자주 밟은 곳은 땅이 단단하게 굳어 있었다. 몇몇 풀은 잎이 축 늘어져 있었다.",
          "학생들은 보이는 모습만으로 판단하지 않고 원인을 자세히 살펴보기로 했다. 햇빛이 드는 시간, 흙의 촉촉한 정도, 사람들이 다니는 길을 차례로 기록했다. 관찰 결과, 길이 아닌 곳까지 사람들이 드나들면서 어린 풀이 많이 상했다는 사실을 알아냈다."
        ]
      },
      {
        heading: "작은 약속 실천하기",
        paragraphs: [
          "학생들은 숲을 보호하면서도 누구나 편하게 관찰할 수 있는 방법을 의논했다. 먼저 나뭇조각으로 관찰 길을 표시하고, 비가 온 뒤 모은 빗물을 화단에 주기로 했다. 안내판에는 명령하는 말 대신 그 행동이 왜 필요한지를 알기 쉽게 설명했다.",
          "한 달 뒤, 관찰 길 밖의 어린 풀이 다시 자라기 시작했다. 학생들은 작은 행동이라도 꾸준히 실천하면 숲을 바꿀 수 있다는 것을 깨달았다. 그리고 관찰 기록을 다음 학년 학생들에게 전해 주기로 했다."
        ]
      }
    ],
    questions: [
      {
        id: "q1",
        prompt: "학생들이 숲의 모습을 보고 가장 먼저 하기로 한 일에 알맞은 말은 무엇인가요?",
        sentence: "학생들은 보이는 모습만으로 판단하지 않고 원인을 자세히 (      )로 했다.",
        answerId: "observe",
        explanation: "원인을 알아내려면 햇빛, 흙, 길의 상태를 자세히 살펴보아야 합니다.",
        options: [
          { id: "observe", text: "살펴보기" },
          { id: "decorate", text: "꾸미기" },
          { id: "hide", text: "감추기" },
          { id: "guess", text: "짐작하기" }
        ]
      },
      {
        id: "q2",
        prompt: "사람들이 자주 밟은 곳의 땅 상태를 가장 알맞게 나타낸 말은 무엇인가요?",
        sentence: "사람들이 자주 밟은 곳은 땅이 (      ) 굳어 있었다.",
        answerId: "firmly",
        explanation: "글에는 사람들이 밟은 곳의 땅이 단단하게 굳었다고 나옵니다.",
        options: [
          { id: "firmly", text: "단단하게" },
          { id: "환하게", text: "환하게" },
          { id: "가볍게", text: "가볍게" },
          { id: "조용하게", text: "조용하게" }
        ]
      },
      {
        id: "q3",
        prompt: "학생들이 여러 내용을 차례로 적은 행동을 나타내는 말은 무엇인가요?",
        sentence: "학생들은 햇빛이 드는 시간과 흙의 상태, 사람들이 다니는 길을 (      ).",
        answerId: "recorded",
        explanation: "관찰한 내용을 차례로 적는 행동은 '기록했다'입니다.",
        options: [
          { id: "recorded", text: "기록했다" },
          { id: "forgot", text: "잊어버렸다" },
          { id: "erased", text: "지워 버렸다" },
          { id: "exchanged", text: "바꾸어 놓았다" }
        ]
      },
      {
        id: "q4",
        prompt: "관찰 결과 알아낸 사실과 가장 잘 어울리는 말은 무엇인가요?",
        sentence: "길이 아닌 곳까지 사람들이 드나들면서 어린 풀이 많이 (      ).",
        answerId: "damaged",
        explanation: "사람들이 밟아서 어린 풀이 피해를 입었다는 내용입니다.",
        options: [
          { id: "damaged", text: "상했다" },
          { id: "increased", text: "늘어났다" },
          { id: "shone", text: "빛났다" },
          { id: "hardened", text: "단단해졌다" }
        ]
      },
      {
        id: "q5",
        prompt: "학생들이 해결 방법을 찾기 위해 한 행동에 알맞은 말은 무엇인가요?",
        sentence: "학생들은 숲을 보호할 방법을 함께 (      ).",
        answerId: "discussed",
        explanation: "여러 사람이 의견을 나누어 방법을 정하는 것은 '의논했다'입니다.",
        options: [
          { id: "discussed", text: "의논했다" },
          { id: "measured", text: "측정했다" },
          { id: "competed", text: "경쟁했다" },
          { id: "ignored", text: "외면했다" }
        ]
      },
      {
        id: "q6",
        prompt: "안내판의 설명 방법을 가장 잘 나타낸 말은 무엇인가요?",
        sentence: "학생들은 행동이 필요한 까닭을 누구나 (      ) 설명했다.",
        answerId: "easily",
        explanation: "안내판에는 행동이 필요한 까닭을 알기 쉽게 설명했습니다.",
        options: [
          { id: "easily", text: "알기 쉽게" },
          { id: "secretly", text: "비밀스럽게" },
          { id: "roughly", text: "대충" },
          { id: "differently", text: "서로 다르게" }
        ]
      },
      {
        id: "q7",
        prompt: "한 달 뒤 어린 풀의 변화를 나타낸 말은 무엇인가요?",
        sentence: "관찰 길 밖의 어린 풀이 다시 (      ) 시작했다.",
        answerId: "grew",
        explanation: "숲을 보호한 뒤 어린 풀이 다시 자라기 시작했습니다.",
        options: [
          { id: "grew", text: "자라기" },
          { id: "disappear", text: "사라지기" },
          { id: "harden", text: "굳어지기" },
          { id: "move", text: "옮겨 가기" }
        ]
      },
      {
        id: "q8",
        prompt: "학생들이 깨달은 내용을 완성하는 데 가장 알맞은 말은 무엇인가요?",
        sentence: "작은 행동이라도 (      ) 실천하면 숲을 바꿀 수 있다.",
        answerId: "steadily",
        explanation: "한 번으로 그치지 않고 꾸준히 실천하는 것이 중요하다는 내용입니다.",
        options: [
          { id: "steadily", text: "꾸준히" },
          { id: "suddenly", text: "갑자기" },
          { id: "carelessly", text: "아무렇게나" },
          { id: "briefly", text: "잠깐만" }
        ]
      }
    ]
  }
};

export function findActivity(activityCode) {
  return activities[String(activityCode ?? "").trim().toUpperCase()] ?? null;
}

