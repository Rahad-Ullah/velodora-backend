import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES, USER_STATUS } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, TUserModal } from './user.interface';

const userSchema = new Schema<IUser, TUserModal>(
  {
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 6,
    },
    credits: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    authentication: {
      type: {
        isSendOtp: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await UserModel.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await UserModel.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

// check user
userSchema.pre('save', async function (next) {
  // check user
  const isExist = await UserModel.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const UserModel = model<IUser, TUserModal>('User', userSchema);
