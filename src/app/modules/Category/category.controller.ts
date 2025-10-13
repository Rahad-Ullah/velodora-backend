import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import pick from '../../../shared/pick';
import { ICategory } from './category.interface';


//create category controller
const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const newCategory = {
      name: req.body.name,
      icon: getSingleFilePath(req.files, 'icon'),
    }
    const result = await CategoryService.createCategoryToDB(newCategory);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//get single category controller
const getCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await CategoryService.getCategoryFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category data retrieved successfully',
    data: result,
  });
});

//get all categories controller
const getCategories = catchAsync(async (req: Request, res: Response) => {
  // Define which query fields are filters
  const filterableFields = ['searchTerm', 'page'];

  // Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // Call service
  const { data, meta } = await CategoryService.getCategoriesFromDB(filterOptions);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: data as Partial<ICategory>[] || [],
    pagination: meta || {},
  });
});

//update category
const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;
    let icon = getSingleFilePath(req.files, 'icon');

    const data = {
      icon,
      name: req.body.name,
    };
    const result = await CategoryService.updateCategoryToDB(data, id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result
    });
  }
);

//delete category
const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await CategoryService.deleteCategoryToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const CategoryController = { createCategory, getCategory, getCategories, updateCategory, deleteCategory };
