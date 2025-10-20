import { StatusCodes } from "http-status-codes";
import { BookingModel } from "../app/modules/booking/booking.model";
import ApiError from "../errors/ApiError";
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from "../enums/booking";
import { ProviderModel } from "../app/modules/provider/provider.model";
import { ScheduleModel } from "../app/modules/schedule/schedule.model";

export const autoCancelBookings = async () => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 5);

  // 🔸 Find bookings created more than 5 min ago and unpaid
  const bookings = await BookingModel.find({
    paymentStatus: BOOKING_PAYMENT_STATUS.UNPAID,
    status: BOOKING_STATUS.PENDING,
    createdAt: { $lt: currentTime }
  });

  if (bookings.length <= 0) {
    console.log('✅ No unpaid bookings to cancel.');
    return;
  }

  console.log(`🛑 Found ${bookings.length} unpaid bookings. Cancelling...`);

  for (const booking of bookings) {
    const provider = await ProviderModel.findById(booking.provider);
    if (!provider) {
      console.warn(`⚠️ Provider not found for booking ${booking._id}`);
      continue;
    }

    const schedule = await ScheduleModel.findById(booking.schedule);
    if (!schedule) {
      console.warn(`⚠️ Schedule not found for booking ${booking._id}`);
      continue;
    }

    // ⏳ Restore slots
    schedule.available_slots.push(...booking.slots);
    schedule.count = Math.max(schedule.count - 1, 0);
    await schedule.save();

    // ❌ Cancel booking
    // booking.status = BOOKING_STATUS.AUTO_CANCELLED;
    const result = await BookingModel.findByIdAndDelete(booking._id);
    if (!result) {
      console.warn(`⚠️ Booking ${booking._id} not found.`);
      continue;
    }

    console.log(`✅ Booking ${booking._id} Deleted.`);
  }

  console.log(`🧹 Auto cancel completed.`);
};
