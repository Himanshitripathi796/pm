# TODO: Add Catch-All Error Handling Route

## Plan
1. Create a catch-all API route at `app/api/[...catchall]/route.ts` to handle unhandled errors
2. The route will:
   - Catch all unmatched API routes
   - Log/print the error details
   - Return a proper error response

## Implementation Steps
- [x] Create `app/api/[...catchall]/route.ts` with error handling logic
