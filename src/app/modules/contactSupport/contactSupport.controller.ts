import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContactSupportService } from './contactSupport.service';


// create Contact Support
const createContactSupport = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ContactSupportService.createContactSupportToDB(req.user.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

// update Contact Support
const updateContactSupport = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ContactSupportService.updateContactSupportToDB(req.params.id, req.body.reply);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

// get Contact Support
const getContactSupport = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ContactSupportService.getContactSupportToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

// get Contact Support
const getContactSupports = catchAsync(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const status = req.query.status ? String(req.query.status) : '';

    const result = await ContactSupportService.getContactSupportsToDB(limit, page, status);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);


export const ContactSupportController = { createContactSupport, updateContactSupport, getContactSupport, getContactSupports };