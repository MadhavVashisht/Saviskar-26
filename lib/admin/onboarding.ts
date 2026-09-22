export type MfaFactor = {
  id: string;
  factor_type?: string;
  status: string;
};

export function validatePassword(password: string, confirmPassword: string): string {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}

export type MfaActionResult =
  | { action: "verify"; factorId: string }
  | { action: "enroll"; unenrollId?: string };

export function getMfaAction(factors: { all: MfaFactor[]; totp: MfaFactor[] }): MfaActionResult {
  const verifiedTotp = factors.totp.find((f) => f.status === "verified");
  if (verifiedTotp) {
    return { action: "verify", factorId: verifiedTotp.id };
  }
  const unverifiedTotp = factors.all.find(
    (f) => f.factor_type === "totp" && f.status === "unverified"
  );
  return {
    action: "enroll",
    unenrollId: unverifiedTotp ? unverifiedTotp.id : undefined,
  };
}

export function validateMfaCodeInput(code: string): {
  error: string;
  cleanCode: string;
} {
  const cleanCode = code.replace(/\D/g, "");
  if (cleanCode.length !== 6) {
    return {
      error: "Enter the 6-digit code from your authenticator app.",
      cleanCode,
    };
  }
  return { error: "", cleanCode };
}
