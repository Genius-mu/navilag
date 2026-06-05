/**
 * NaviLag — Auth callback handler
 *
 * Supabase redirects users here after they click a link in an email
 * (sign-up confirmation, password reset, email change).
 *
 * Supabase uses TWO URL shapes depending on the flow:
 *
 *   1. ?code=XXX
 *      The OAuth-style "code exchange" flow. Used for OAuth providers
 *      and for password reset on web. We swap the code for a session
 *      via exchangeCodeForSession().
 *
 *   2. ?token_hash=XXX&type=signup (or recovery, or email_change)
 *      The modern email-OTP flow used for sign-up confirmation by
 *      default in newer Supabase projects. We verify it with verifyOtp().
 *
 * We handle both. After success we redirect to ?next= (defaulting to
 * /map). On failure we send them to /sign-in?auth_error=1 with a
 * banner explaining the link expired or was reused.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/map";

  // ---------- Flow 1: code exchange ----------
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/sign-in?auth_error=1`);
  }

  // ---------- Flow 2: email OTP (token_hash) ----------
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/sign-in?auth_error=1`);
  }

  // No recognizable params — fall through with an error flag
  return NextResponse.redirect(`${origin}/sign-in?auth_error=1`);
}
