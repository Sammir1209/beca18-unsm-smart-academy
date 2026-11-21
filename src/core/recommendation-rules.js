export function buildRecommendations(mistakes = [], questions = []) {
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const grouped = new Map();

  for (const mistake of mistakes) {
    if (!mistake || mistake.mastered) continue;

    const question = questionById.get(mistake.questionId);
    const topic = String(mistake.topic || question?.topic || "Tema por identificar").trim();
    const subject = String(question?.subject || "Curso general").trim();
    const key = `${subject.toLocaleLowerCase("es")}::${topic.toLocaleLowerCase("es")}`;
    const item = grouped.get(key) || {
      topic,
      subject,
      failCount: 0,
      doubtCount: 0,
      questionCount: 0,
    };

    item.failCount += Math.max(0, Number(mistake.failCount) || 0);
    item.doubtCount += Math.max(0, Number(mistake.doubtCount) || 0);
    item.questionCount += 1;
    grouped.set(key, item);
  }

  return [...grouped.values()]
    .sort((a, b) =>
      (b.failCount * 2 + b.doubtCount) - (a.failCount * 2 + a.doubtCount)
      || a.topic.localeCompare(b.topic, "es")
    )
    .slice(0, 3)
    .map((item) => ({
      topic: item.topic,
      subject: item.subject,
      priority: item.failCount >= 2 || item.failCount + item.doubtCount >= 3 ? "ALTA" : "MEDIA",
      action: `${item.failCount} ${item.failCount === 1 ? "fallo" : "fallos"} y ${item.doubtCount} ${item.doubtCount === 1 ? "duda" : "dudas"} registradas en ${item.questionCount} pregunta(s). Refuerza el concepto y vuelve a practicar el tema.`,
    }));
}
