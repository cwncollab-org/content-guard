import { useContext } from "react";
import { contentGuardContext } from "./ContentGuardContext";

export function useContentGuard() {
  return useContext(contentGuardContext);
}
