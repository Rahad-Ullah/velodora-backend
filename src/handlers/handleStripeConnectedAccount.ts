import mongoose from "mongoose";
import Stripe from "stripe";
import { UserModel } from "../app/modules/user/user.model";
import stripe from "../app/config/stripe.config";

export const handleStripeConnectedAccount = async (data: Stripe.Account) => {
  console.log("handleStripeConnectedAccount---------------", data)

  const session = await mongoose.startSession();
  try {
    session.startTransaction()

    const email = data?.email

    if (!email) {
      throw new Error('Connected account email not found');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Connected account user not found')
    }

    const isAccountReady =
      data.details_submitted &&
      data.charges_enabled &&
      data.payouts_enabled &&
      !data.requirements?.disabled_reason;

    const loginUrl = await stripe.accounts.createLoginLink(data.id)

    await UserModel.findOneAndUpdate({ email }, { stripeAccountInfo: { stripeAccountId: data.id, stripeLoginUrl: loginUrl.url, isAccountReady: isAccountReady } })

    await session.commitTransaction()
    await session.endSession()


  } catch (error) {
    session.abortTransaction()
    await session.endSession()
    console.log(error)
    return
  }
};