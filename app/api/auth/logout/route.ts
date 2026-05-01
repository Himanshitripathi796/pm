import { errorResponse, successResponse } from "@/lib/api-response";
import { clearAuthCookie, requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    await requireAuth();
  } catch {
    return errorResponse("Unauthorized.", 401);
  }

  await clearAuthCookie();
  return successResponse({ loggedOut: true });
}
