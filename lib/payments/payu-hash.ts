import crypto from "crypto";

/**
 * Generate PayU SHA-512 Hash
 * 
 * Request hash (forward):
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayURequestHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}): string {
  const {
    key, txnid, amount, productinfo, firstname, email,
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "", salt
  } = params;

  // The 5 UDFs are followed by 5 empty strings (udf6-udf10 are usually empty), then salt.
  // The exact sequence required by PayU:
  // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}

/**
 * Verify PayU Response Hash
 * 
 * Response hash (reverse):
 * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * OR with additional_charges:
 * sha512(additional_charges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(params: {
  status: string;
  udf5?: string;
  udf4?: string;
  udf3?: string;
  udf2?: string;
  udf1?: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
  salt: string;
  additionalCharges?: string;
  receivedHash: string;
}): boolean {
  const {
    status, email, firstname, productinfo, amount, txnid, key, salt,
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "",
    additionalCharges, receivedHash
  } = params;

  if (!receivedHash) return false;

  const sanitizeSecret = (val: string) => val.trim().replace(/^["']+|["']+$/g, "").trim();
  const cleanSalt = sanitizeSecret(salt);
  const cleanKey = sanitizeSecret(key);
  const cleanReceived = receivedHash.trim().toLowerCase();

  // PayU response hash candidate 1: Standard reverse hash:
  // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  const baseSequence = `${cleanSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${cleanKey}`;
  const candidates: string[] = [baseSequence];

  // PayU response hash candidate 2: If additionalCharges is present/provided:
  // sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  if (additionalCharges && additionalCharges.trim().length > 0) {
    candidates.unshift(`${additionalCharges.trim()}|${baseSequence}`);
  }

  for (const candidate of candidates) {
    const computedHash = crypto.createHash("sha512").update(candidate).digest("hex").toLowerCase();
    try {
      if (
        crypto.timingSafeEqual(
          Buffer.from(computedHash, "utf-8"),
          Buffer.from(cleanReceived, "utf-8")
        )
      ) {
        return true;
      }
    } catch {
      // Buffer length mismatch or comparison error; continue to next candidate
    }
  }

  return false;
}

/**
 * Generate PayU Command Hash (for Verify Payment API)
 * 
 * Command hash:
 * sha512(key|command|var1|salt)
 */
export function generatePayUCommandHash(params: {
  key: string;
  command: string;
  var1: string;
  salt: string;
}): string {
  const { key, command, var1, salt } = params;
  const hashString = `${key}|${command}|${var1}|${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}
