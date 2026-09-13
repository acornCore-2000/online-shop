import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      statusCode: err.statusCode,
      message: err.message,
      timestamp: new Date().toISOString(),
    })
  }

  const errorCode = typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined
  const errorType = typeof err === 'object' && err !== null && 'type' in err
    ? (err as { type?: string }).type
    : undefined

  if (errorType === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'fail',
      statusCode: 400,
      message: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString(),
    })
  }

  if (errorCode === '23505') {
    return res.status(409).json({
      status: 'fail',
      statusCode: 409,
      message: 'Duplicate field value entered',
      timestamp: new Date().toISOString(),
    })
  }

  if (errorCode === '22P02') {
    return res.status(400).json({
      status: 'fail',
      statusCode: 400,
      message: 'Invalid data format',
      timestamp: new Date().toISOString(),
    })
  }

  console.error('Unhandled Error:', err)

  res.status(500).json({
    status: 'fail',
    statusCode: 500,
    message: 'Something went wrong on the server',
    timestamp: new Date().toISOString(),
  })
}

export const catchAsyncError = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
