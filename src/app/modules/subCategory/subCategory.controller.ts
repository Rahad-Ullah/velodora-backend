import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { SubCategoryService } from './subCategory.service';
import pick from '../../../shared/pick';
import { ISubCategory } from './subCategory.interface';
import mongoose from 'mongoose';


//create sub category controller
const createSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await SubCategoryService.createSubCategoryToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
    });
  }
);

//get single sub category controller
const getSubCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await SubCategoryService.getSubCategoryFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sub Category data retrieved successfully',
    data: result.data,
  });
});

//get all categories controller
const getSubCategories = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const { data } = await SubCategoryService.getSubCategoriesFromDB(req.query);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Sub Categories data retrieved successfully',
    data: data as Partial<ISubCategory>[] || [],
  });
});

//update category
const updateSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;

    const result = await SubCategoryService.updateSubCategoryToDB(req.body, id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.res,
    });
  }
);

//delete category
const deleteSubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await SubCategoryService.deleteSubCategoryToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const SubCategoryController = { createSubCategory, getSubCategory, getSubCategories, updateSubCategory, deleteSubCategory };