import React, { createContext, useContext, useState, ReactNode } from "react";

export type TitleContextType = {
  title: string;
  setTitle: (t: string) => void;
};

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const useTitle = () => {
  const ctx = useContext(TitleContext);
  if (!ctx) throw new Error("useTitle must be used within TitleProvider");
  return ctx;
};

export const TitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("Grad Project");
  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};
