import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "zh";
const LocaleContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (zh: string, en: string) => string;
}>({ language: "en", setLanguage: () => {}, t: (_, en) => en });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem("choney-language") === "zh" ? "zh" : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.language = language;
    document.title =
      language === "en"
        ? "Tianyi Chen / Choney — Research & Engineering"
        : "陈天一 Choney — 研究与工程";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        language === "en"
          ? "Choney Chen, a Computer Science and Technology undergraduate at XJTLU. Explore my work in visual and spatial perception, environmental AI, and engineering systems."
          : "陈天一，西交利物浦大学计算机科学与技术本科生。探索我的视觉与空间感知、环境 AI、软件与工程原型经历。",
      );
    try {
      localStorage.setItem("choney-language", language);
    } catch {
      /* A private session still supports switching. */
    }
  }, [language]);
  return (
    <LocaleContext.Provider
      value={{
        language,
        setLanguage,
        t: (zh, en) => (language === "zh" ? zh : en),
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  return useContext(LocaleContext);
}
