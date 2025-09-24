// util/cleanupDaily.ts
import cron from "node-cron";
import { UserService } from "../app/modules/user/user.service";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Running cleanup job...");
  
  try {
    await UserService.hardDeleteUsersFromDB();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});