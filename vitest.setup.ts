// vitest.setup.ts - Test Environment Isolation
import { beforeAll } from "vitest";

// Guard against tests ever touching production Supabase database
const PRODUCTION_SUPABASE_HOSTS = [
  "ikavnyjfmdxjnlbovkzm.supabase.co",
];

beforeAll(() => {
  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  
  for (const prodHost of PRODUCTION_SUPABASE_HOSTS) {
    if (currentUrl.includes(prodHost) && !process.env.ALLOW_PROD_SUPABASE_IN_TESTS) {
      // Force test isolation: replace live production URL with local mock URL for the test runner
      process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
      process.env.SUPABASE_SECRET_KEY = "mock-service-role-key-test-environment-isolated";
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "mock-anon-key-test-environment-isolated";
    }
  }
});
