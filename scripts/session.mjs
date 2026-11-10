import { createHmac } from "node:crypto";

const secret = process.env.AUTH_SECRET;
if (!secret) {
  console.error("Set AUTH_SECRET in .env first.");
  process.exit(1);
}

const payload = Buffer.from(
  JSON.stringify({
    id: "smoke-test-user",
    email: "femmebeautybysyl@gmail.com",
    name: "Syl",
    exp: Date.now() + 24 * 60 * 60_000,
  }),
).toString("base64url");
const signature = createHmac("sha256", secret).update(payload).digest("base64url");
console.log(`fb_session=${payload}.${signature}`);
