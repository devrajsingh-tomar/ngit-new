import ExcelJS from "exceljs";

export async function parseExcelQuestions(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error("Worksheet not found");

  const questions: any[] = [];
  const errors: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    try {
      const rowData: any = {
        examName: row.getCell(1).value?.toString(),
        type: row.getCell(2).value?.toString(),
        question_en: row.getCell(3).value?.toString(),
        question_hi: row.getCell(4).value?.toString(),
        optionA: row.getCell(5).value?.toString(),
        optionB: row.getCell(6).value?.toString(),
        optionC: row.getCell(7).value?.toString(),
        optionD: row.getCell(8).value?.toString(),
        correctAnswer: row.getCell(9).value?.toString(),
        difficulty: row.getCell(10).value?.toString() || "MEDIUM",
        language: row.getCell(11).value?.toString() || "en",
        explanation: row.getCell(12).value?.toString(),
        match_pairs: row.getCell(13).value?.toString(),
        assertion: row.getCell(14).value?.toString(),
        reason: row.getCell(15).value?.toString(),
        typing_passage: row.getCell(16).value?.toString(),
      };

      const transformed = transformRowToQuestion(rowData, rowNumber);
      questions.push(transformed);
    } catch (error: any) {
      errors.push({ row: rowNumber, message: error.message });
    }
  });

  return { questions, errors };
}

function transformRowToQuestion(row: any, rowNumber: number) {
  if (!row.type) throw new Error("Missing question type");
  if (!row.question_en) throw new Error("Missing English question content");

  const base: any = {
    type: row.type.toUpperCase().replace(/\s+/g, "_"),
    difficulty: row.difficulty?.toUpperCase() || "MEDIUM",
    content: {
      en: row.question_en,
      hi: row.question_hi || "",
    },
    marks: Number(row.marks) || 4,
    negativeMarks: Number(row.negativeMarks) || 1,
    explanation: {
      en: row.explanation || "",
    },
    topic: row.topic || row.examName || "General",
    subject: row.subject || row.examName || "General",
    examCode: row.examCode || "GEN-01",
  };

  // Normalize type
  if (base.type === "SINGLE_MCQ") base.type = "MCQ_SINGLE";
  if (base.type === "MULTI_MCQ") base.type = "MCQ_MULTIPLE";
  if (base.type === "SHORT") base.type = "SHORT_ANSWER";
  if (base.type === "MATCH") base.type = "MATCH_THE_FOLLOWING";

  switch (base.type) {
    case "MCQ_SINGLE": {
      if (!row.optionA || !row.optionB) throw new Error("MCQ requires at least Option A and B");
      if (!row.correctAnswer) throw new Error("MCQ requires correctAnswer (A, B, C, or D)");
      
      const options = [
        { text: { en: row.optionA }, isCorrect: row.correctAnswer === "A" },
        { text: { en: row.optionB }, isCorrect: row.correctAnswer === "B" },
        { text: { en: row.optionC || "" }, isCorrect: row.correctAnswer === "C" },
        { text: { en: row.optionD || "" }, isCorrect: row.correctAnswer === "D" },
      ].filter(o => o.text.en);
      
      base.options = options;
      break;
    }

    case "MCQ_MULTIPLE": {
      if (!row.optionA || !row.optionB) throw new Error("MCQ requires at least Option A and B");
      if (!row.correctAnswer) throw new Error("MCQ_MULTIPLE requires correctAnswer (e.g., A,C)");
      
      const correctOptions = row.correctAnswer.split(",").map((s: string) => s.trim().toUpperCase());
      const options = [
        { text: { en: row.optionA }, isCorrect: correctOptions.includes("A") },
        { text: { en: row.optionB }, isCorrect: correctOptions.includes("B") },
        { text: { en: row.optionC || "" }, isCorrect: correctOptions.includes("C") },
        { text: { en: row.optionD || "" }, isCorrect: correctOptions.includes("D") },
      ].filter(o => o.text.en);
      
      base.options = options;
      break;
    }

    case "TRUE_FALSE": {
      if (!row.correctAnswer) throw new Error("TRUE_FALSE requires correctAnswer (A for True, B for False)");
      const isTrue = row.correctAnswer === "A" || row.correctAnswer.toLowerCase() === "true";
      base.options = [
        { text: { en: "True" }, isCorrect: isTrue },
        { text: { en: "False" }, isCorrect: !isTrue },
      ];
      break;
    }

    case "NUMERIC": {
      if (row.correctAnswer === undefined) throw new Error("NUMERIC requires correctAnswer (number)");
      base.numericAnswer = parseFloat(row.correctAnswer);
      break;
    }

    case "SHORT_ANSWER": {
      base.shortAnswer = row.correctAnswer || "";
      break;
    }

    case "DESCRIPTIVE": {
      break;
    }

    case "MATCH_THE_FOLLOWING": {
      if (!row.match_pairs) throw new Error("MATCH requires match_pairs JSON (e.g. {\"A\":\"1\", \"B\":\"2\"})");
      try {
        const pairs = typeof row.match_pairs === 'string' ? JSON.parse(row.match_pairs) : row.match_pairs;
        base.options = Object.entries(pairs).map(([key, val]) => ({
          text: { en: key },
          pair: { en: val!.toString() },
          isCorrect: true
        }));
      } catch (e) {
        throw new Error("Invalid match_pairs JSON format. Example: {\"Apple\":\"Red\", \"Banana\":\"Yellow\"}");
      }
      break;
    }

    case "ASSERTION_REASON": {
      if (!row.assertion || !row.reason) throw new Error("ASSERTION_REASON requires assertion and reason columns");
      base.assertion = { en: row.assertion };
      base.reason = { en: row.reason };
      // Map A=0, B=1, C=2, D=3
      const answerMap: any = { "A": 0, "B": 1, "C": 2, "D": 3 };
      base.numericAnswer = answerMap[row.correctAnswer?.toUpperCase()] !== undefined ? answerMap[row.correctAnswer.toUpperCase()] : 0;
      break;
    }

    case "TYPING": {
      if (!row.typing_passage) throw new Error("TYPING requires typing_passage content");
      base.shortAnswer = row.typing_passage;
      break;
    }

    default:
      throw new Error(`Unsupported question type: ${row.type}`);
  }

  return base;
}

export async function generateSampleTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Questions");

  worksheet.columns = [
    { header: "examName", key: "examName", width: 15 },
    { header: "type", key: "type", width: 20 },
    { header: "question_en", key: "question_en", width: 40 },
    { header: "question_hi", key: "question_hi", width: 40 },
    { header: "optionA", key: "optionA", width: 20 },
    { header: "optionB", key: "optionB", width: 20 },
    { header: "optionC", key: "optionC", width: 20 },
    { header: "optionD", key: "optionD", width: 20 },
    { header: "correctAnswer", key: "correctAnswer", width: 15 },
    { header: "difficulty", key: "difficulty", width: 12 },
    { header: "marks", key: "marks", width: 8 },
    { header: "negativeMarks", key: "negativeMarks", width: 15 },
    { header: "explanation", key: "explanation", width: 40 },
    { header: "match_pairs", key: "match_pairs", width: 40 },
    { header: "assertion", key: "assertion", width: 40 },
    { header: "reason", key: "reason", width: 40 },
    { header: "typing_passage", key: "typing_passage", width: 50 },
  ];

  // Formatting headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  // Add examples for each type
  worksheet.addRow(["O Level", "MCQ_SINGLE", "What is the full form of CPU?", "CPU का पूर्ण रूप क्या है?", "Central Process Unit", "Central Processing Unit", "Control Process Unit", "Core Processing Unit", "B", "EASY", 4, 1, "CPU stands for Central Processing Unit."]);
  worksheet.addRow(["O Level", "MCQ_MULTIPLE", "Which of the following are output devices?", "इनमें से कौन आउटपुट डिवाइस हैं?", "Monitor", "Printer", "Keyboard", "Mouse", "A,B", "MEDIUM", 4, 1, "Monitor and Printer are output devices."]);
  worksheet.addRow(["General", "TRUE_FALSE", "Is Python an interpreted language?", "क्या पायथन एक इंटरप्रिटेड भाषा है?", "True", "False", "", "", "A", "EASY", 4, 0, "Python is indeed an interpreted language."]);
  worksheet.addRow(["Maths", "NUMERIC", "What is the square root of 144?", "", "", "", "", "", "12", "MEDIUM", 4, 1, "12 * 12 = 144"]);
  worksheet.addRow(["English", "SHORT_ANSWER", "Who wrote 'Romeo and Juliet'?", "", "", "", "", "", "Shakespeare", "EASY", 4, 0]);
  worksheet.addRow(["Science", "MATCH_THE_FOLLOWING", "Match the following chemicals with their formulas", "", "", "", "", "", "", "HARD", 4, 1, "Matching chemicals to formulas", '{"Water":"H2O", "Salt":"NaCl", "Oxygen":"O2"}']);
  worksheet.addRow(["History", "ASSERTION_REASON", "Assertion: The battle of Panipat was significant. Reason: It changed the course of Indian history.", "", "", "", "", "", "A", "MEDIUM", 4, 1, "A means both are true and R is correct explanation", "", "The battle of Panipat was significant", "It changed the course of Indian history"]);
  worksheet.addRow(["General", "DESCRIPTIVE", "Explain the impact of Global Warming on polar bears.", "", "", "", "", "", "", "MEDIUM", 10, 0, "Evaluation is manual for descriptive questions."]);
  worksheet.addRow(["Typing", "TYPING", "Instructions: Type the text below exactly as shown.", "", "", "", "", "", "", "MEDIUM", 50, 0, "Typing test evaluation based on WPM and Accuracy.", "", "", "", "", "The quick brown fox jumps over the lazy dog. Continuous practice improves typing speed and accuracy significantly over time."]);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
