import cron from "node-cron";
import { autoCancelBookings } from "../cleanUp/autoCancelBooking";

cron.schedule("* * * * *", async () => {
  try {
    await autoCancelBookings();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});