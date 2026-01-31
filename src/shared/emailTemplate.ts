import { IContactSupport, ICreateAccount, ISendOtp, ISettingsEmailTemplate } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dbq7y6byo/image/upload/v1762333843/logos/verticleMail_frjbxs.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px; text-align: center;">Hey! ${values.name}, Verify your account</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const sendOtp = (values: ISendOtp) => {
  const data = {
    to: values.email,
    subject: 'One Time Password',
    html: `<body style="font-family: Arial, sans-serif; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dbq7y6byo/image/upload/v1762333843/logos/verticleMail_frjbxs.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:240px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use OTP code</p>
            <div style="background-color: #277E16; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              This code is valid for 3 minutes.
            </p>
            <p style="color: #b9b4b4; font-size: 12px; line-height: 1; margin-bottom: 20px; text-align:left">
              If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
            </p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const contactSupport = (values: IContactSupport) => {
  const data = {
    to: values.email,
    subject: values.sub,
    html:
      `<body style="font-family: Arial, sans-serif; margin: 50px; padding: 20px; color: #555;">
        <div style="text-align: center; background-color: #fff;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Your message:</b>${values.msg}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Admin Reply:</b>${values.reply}</p>
        </div>
      </body>`,
  };
  return data;
};

const contactSupportForUser = (values: IContactSupport) => {
  const data = {
    from: values.email,
    subject: values.sub,
    html:
      `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Your message:</b>${values.msg}</p>
        </div>
      </body>`,
  };
  return data;
};

const settingsEmailTemplate = (values: ISettingsEmailTemplate) => {
  const data = {
    to: values?.email,
    subject: 'Settings Updated',
    html: `<div>
        <p>Dear ${values?.name},<br/></p>
        <p>Velodora has updated ${values?.message}. Please visit your profile to see the changes.<br/></p>
        <p>Best regards,<br/>The Velodora Team</p>
      </div>`,
  };
  return data;
};

const blockUnblockEmailTemplate = (values: ISettingsEmailTemplate) => {
  const data = {
    to: values?.email,
    subject: 'Account Status Updated',
    html: `<div>
        <p>Dear ${values?.name},<br/></p>
        <p>${values?.message}<br/></p>
        <p>Best regards,<br/>The Velodora Team</p>
      </div>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  sendOtp,
  contactSupport,
  contactSupportForUser,
  settingsEmailTemplate,
  blockUnblockEmailTemplate,
};
