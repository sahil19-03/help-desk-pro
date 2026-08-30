// Vercel serverless entry point.
// This file is picked up automatically by Vercel because it lives in /api/.
// It imports the Express app and re-exports it as a serverless handler so that
// all requests to /api/* on Vercel are handled by the same Express routes.

import app from '../server/src/index.js';

export default app;
