import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale negotiation + redirects (Next.js 16 "proxy" convention). Admin auth is
// enforced in the admin layout (server-side) to keep this focused on i18n.
export default createMiddleware(routing);

export const config = {
  // Match all paths except API, Next internals, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
