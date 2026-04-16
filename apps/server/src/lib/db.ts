/**
 * DB connection stub.
 * Supabase will be wired in a later phase. For now we run fully in-memory
 * so the app starts without a database URL.
 */
export async function connectDB(): Promise<void> {
  if (process.env['MONGODB_URI'] || process.env['DATABASE_URL']) {
    console.info('📦 DB URL detected — skipping in-memory mode (connect logic pending)');
  } else {
    console.info('💾 No DB URL — running in-memory (Supabase to be wired later)');
  }
}
