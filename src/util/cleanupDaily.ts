import cron from "node-cron";
import { autoCancelBookings, autoDeletePendingBookings, sendNotificationsForPendingBookings } from "../app/modules/booking/booking.service";

cron.schedule("* * * * *", async () => {
  // console.log("Node Corn Working")
  try {
    await autoCancelBookings();
    await autoDeletePendingBookings();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});

cron.schedule("*/10 * * * *", async () => {
  try {
    await sendNotificationsForPendingBookings();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});
