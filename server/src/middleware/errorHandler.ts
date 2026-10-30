import { Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};
