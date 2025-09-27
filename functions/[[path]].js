// Cloudflare Pages Functions catch-all route
// Handles all requests and forwards to Workers application
// This enables deployment via Cloudflare Pages for easier integration

export { default } from '../workers/index.js';