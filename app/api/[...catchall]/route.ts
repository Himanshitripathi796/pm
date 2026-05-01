import { NextRequest, NextResponse } from "next/server";

/**
 * Catch-all route for unhandled API errors.
 * This will intercept any unmatched API routes and provide proper error handling.
 */

export async function GET(request: NextRequest) {
  return handleError(request);
}

export async function POST(request: NextRequest) {
  return handleError(request);
}

export async function PUT(request: NextRequest) {
  return handleError(request);
}

export async function PATCH(request: NextRequest) {
  return handleError(request);
}

export async function DELETE(request: NextRequest) {
  return handleError(request);
}

function handleError(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Log the error to console
  console.error(`[ERROR] Unhandled API route: ${method} ${path}`);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: `API route not found: ${method} ${path}`,
        details: "The requested endpoint does not exist.",
      },
    },
    { status: 404 }
  );
}
