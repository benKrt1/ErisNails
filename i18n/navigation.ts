import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation helpers used across the app.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
