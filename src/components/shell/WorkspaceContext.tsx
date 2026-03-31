"use client";

import { createContext, ReactNode, useContext } from "react";

type WorkspaceContextValue = {
  schoolName: string | null;
  sessionName: string | null;
  termName: string | null;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  schoolName: null,
  sessionName: null,
  termName: null,
});

export function WorkspaceContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: WorkspaceContextValue;
}) {
  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
