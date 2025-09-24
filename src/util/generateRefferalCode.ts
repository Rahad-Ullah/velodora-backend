// utils/referralGenerator.ts
import { nanoid } from "nanoid";
import { ReferralModel } from "../app/modules/referral/referral.model";

// Generate unique code and ensure DB uniqueness
export async function generateUniqueReferralCode() {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(8).toUpperCase(); // Example: "X1Y2Z3AB"
    exists = await ReferralModel.findOne({ code }) ? true : false; // check in DB
  }

  return code;
}