import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Flame,
  GraduationCap,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import type { QuizQuestion } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | QuizQuestion["category"];

export const QuizPage: React.FC = () => {
  const { t, language, recordQuizResult } = useApp();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestSessionStreak, setBestSessionStreak] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    if (category === "all") return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter((q) => q.category === category);
  }, [category]);

  const currentQuestion = questions[currentIndex];

  const restartQuiz = (nextCategory: CategoryFilter = category) => {
    setCategory(nextCategory);
    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setStreak(0);
    setBestSessionStreak(0);
    setEarnedXp(0);
    setFinished(false);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);
    if (idx === currentQuestion.correctIndex) {
      const nextStreak = streak + 1;
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
      setBestSessionStreak((b) => Math.max(b, nextStreak));
      setEarnedXp((xp) => xp + currentQuestion.xp);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      recordQuizResult(correctCount, questions.length, bestSessionStreak, earnedXp);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const categories: Array<{ id: CategoryFilter; labelEn: string; labelHi: string }> = [
    { id: "all", labelEn: t.quiz.allCategories, labelHi: t.quiz.allCategories },
    { id: "passwords", labelEn: "Passwords", labelHi: "पासवर्ड" },
    { id: "phishing", labelEn: "Phishing", labelHi: "फ़िशिंग" },
    { id: "mfa", labelEn: "MFA & Passkeys", labelHi: "MFA और पासकी" },
    { id: "network", labelEn: "Network", labelHi: "नेटवर्क" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.quiz.title}
        subtitle={t.quiz.subtitle}
        badge={
          <Badge variant="default">
            <Flame className="h-3 w-3 text-amber-400" />
            {t.quiz.streak}: {streak}
          </Badge>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={category === c.id ? "default" : "outline"}
            onClick={() => restartQuiz(c.id)}
          >
            {language === "hi" ? c.labelHi : c.labelEn}
          </Button>
        ))}
      </div>

      {finished ? (
        <Card className="border-emerald-500/30">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold">{t.quiz.completedTitle}</h2>
              <p className="text-muted-foreground text-sm">
                {correctCount}/{questions.length} • +{earnedXp} XP • Best Streak: {bestSessionStreak}
              </p>
            </div>
            <Button onClick={() => restartQuiz(category)}>
              <RotateCcw className="h-4 w-4" />
              {t.quiz.startQuiz}
            </Button>
          </CardContent>
        </Card>
      ) : (
        currentQuestion && (
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Question {currentIndex + 1} / {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase">
                    {currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="emerald">+{currentQuestion.xp} XP</Badge>
                </div>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} />
              <CardTitle className="text-lg leading-snug pt-1">
                {language === "hi"
                  ? currentQuestion.questionHi
                  : currentQuestion.questionEn}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                {(language === "hi"
                  ? currentQuestion.optionsHi
                  : currentQuestion.optionsEn
                ).map((option, idx) => {
                  const answered = selectedOption !== null;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isSelected = idx === selectedOption;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        "w-full text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition-all flex items-center justify-between gap-3",
                        !answered &&
                          "border-border/80 bg-secondary/35 hover:border-primary/60 hover:bg-secondary/70",
                        answered &&
                          isCorrect &&
                          "border-emerald-500/60 bg-emerald-500/15 text-emerald-500",
                        answered &&
                          isSelected &&
                          !isCorrect &&
                          "border-destructive/60 bg-destructive/15 text-destructive",
                        answered &&
                          !isCorrect &&
                          !isSelected &&
                          "border-border/50 opacity-60"
                      )}
                    >
                      <span>{option}</span>
                      {answered && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      {answered && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="rounded-xl border border-border/80 bg-secondary/45 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    {selectedOption === currentQuestion.correctIndex
                      ? t.quiz.correct
                      : t.quiz.incorrect}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === "hi"
                      ? currentQuestion.explanationHi
                      : currentQuestion.explanationEn}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button onClick={handleNext}>
                      {currentIndex + 1 >= questions.length
                        ? t.quiz.finishQuiz
                        : t.quiz.nextQuestion}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};
