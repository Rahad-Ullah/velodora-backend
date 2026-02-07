import { StatusCodes } from "http-status-codes";
import { BookingModel } from "../app/modules/booking/booking.model";
import ApiError from "../errors/ApiError";
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from "../enums/booking";
import { ProviderModel } from "../app/modules/provider/provider.model";
import { ScheduleModel } from "../app/modules/schedule/schedule.model";
import { UserModel } from "../app/modules/user/user.model";


// This function not used anywhere, The same function in booking service.
export const autoCancelBookings = async () => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 5);

  // Find bookings created more than 5 min ago and unpaid
  const bookings = await BookingModel.find({
    paymentStatus: BOOKING_PAYMENT_STATUS.UNPAID,
    status: BOOKING_STATUS.PENDING,
    createdAt: { $lt: currentTime }
  });

  // Check bookings length
  if (bookings.length <= 0) {
    return;
  }

  try {
    for (const booking of bookings) {

      const provider = await ProviderModel.findById(booking.provider);
      if (!provider) {
        continue;
      }

      const schedule = await ScheduleModel.findById(booking.schedule);
      if (!schedule) {
        continue;
      }

      // ⏳ Restore slots
      schedule.available_slots.push(...booking.slots);
      schedule.count = Math.max(schedule.count - 1, 0);
      await schedule.save();


      await UserModel.findByIdAndUpdate(booking.user, {
        $inc: { 'credits': booking?.useCredits }
      });

      // ❌ Delete booking
      const result = await BookingModel.findByIdAndDelete(booking._id);
      if (!result) {
        continue;
      }
    }
  } catch (error: any) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message ?? "Something went wrong in autoCancelBookings");
  }
};