import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse, errorResponse } from '../utils/response';
import { FinancialRecordService } from '../services/financialRecordService';

export const createRecord = asyncHandler(async (req: Request, res: Response) => {
  const { amount, type, category, transactionDate, description } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  if (!amount || !type || !category || !transactionDate) {
    res.status(400).json(
      errorResponse('Missing required fields: amount, type, category, transactionDate', req.path)
    );
    return;
  }

  const record = await FinancialRecordService.createRecord(
    userId,
    amount,
    type,
    category,
    new Date(transactionDate),
    description
  );

  res.status(201).json(
    successResponse(record, req.path, 'Record created successfully')
  );
});

export const getUserRecords = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const { startDate, endDate, category, type, limit = '50', offset = '0' } = req.query;

  const filters = {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    category: category as string,
    type: type as 'income' | 'expense',
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  };

  const records = await FinancialRecordService.getUserRecords(userId, filters);

  res.status(200).json(
    successResponse(records, req.path, `Found ${records.length} records`)
  );
});

export const getRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const record = await FinancialRecordService.getRecordById(Number(id), userId);

  res.status(200).json(successResponse(record, req.path));
});

export const updateRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const { amount, type, category, transactionDate, description } = req.body;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const record = await FinancialRecordService.updateRecord(Number(id), userId, {
    amount,
    type,
    category,
    transactionDate: transactionDate ? new Date(transactionDate) : undefined,
    description,
  });

  res.status(200).json(
    successResponse(record, req.path, 'Record updated successfully')
  );
});

export const deleteRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  await FinancialRecordService.deleteRecord(Number(id), userId);

  res.status(200).json(successResponse({ id }, req.path, 'Record deleted successfully'));
});
