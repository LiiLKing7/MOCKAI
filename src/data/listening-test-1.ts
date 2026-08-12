export interface Question {
  id: string;
  number: number;
  type: "multiple_choice" | "matching" | "fill_in_the_blank";
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface ListeningPart {
  id: string;
  partNumber: number;
  title: string;
  instructions: string;
  audioSrc: string;
  questions: Question[];
}

export const listeningTest1: ListeningPart[] = [
  {
    id: "part-1",
    partNumber: 1,
    title: "Multiple Choice (Short Statements)",
    instructions: "Listen to the short statements. For each question, choose the best response (A, B, or C).",
    audioSrc: "/listening-part1.wav",
    questions: [
      {
        id: "l1-q1",
        number: 1,
        type: "multiple_choice",
        question: "Speaker 1",
        options: ["It was big last year.", "That is cheap.", "Yes, I like everything."],
        correctAnswer: "That is cheap.",
      },
      {
        id: "l1-q2",
        number: 2,
        type: "multiple_choice",
        question: "Speaker 2",
        options: ["8:00", "8:30", "9:30"],
        correctAnswer: "8:30",
      },
      {
        id: "l1-q3",
        number: 3,
        type: "multiple_choice",
        question: "Speaker 3",
        options: ["In a meeting.", "At home.", "On a holiday."],
        correctAnswer: "In a meeting.",
      },
      {
        id: "l1-q4",
        number: 4,
        type: "multiple_choice",
        question: "Speaker 4",
        options: ["A ticket.", "A helmet.", "A license."],
        correctAnswer: "A helmet.",
      },
      {
        id: "l1-q5",
        number: 5,
        type: "multiple_choice",
        question: "Speaker 5",
        options: ["Eggs and cheese.", "Milk and bread.", "Fruits and vegetables."],
        correctAnswer: "Milk and bread.",
      },
      {
        id: "l1-q6",
        number: 6,
        type: "multiple_choice",
        question: "Speaker 6",
        options: ["Sunday.", "Monday.", "Friday."],
        correctAnswer: "Monday.",
      },
      {
        id: "l1-q7",
        number: 7,
        type: "multiple_choice",
        question: "Speaker 7",
        options: ["To turn on the TV.", "To reduce the volume.", "To change the channel."],
        correctAnswer: "To reduce the volume.",
      },
      {
        id: "l1-q8",
        number: 8,
        type: "multiple_choice",
        question: "Speaker 8",
        options: ["Teacher.", "Doctor.", "Software engineer."],
        correctAnswer: "Software engineer.",
      },
    ],
  },
];
