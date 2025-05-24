import { Alert, Platform } from 'react-native';
import * as Sentry from 'sentry-expo';

interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  code: string | number;
  status: number;
  details: any;
  isOperational: boolean;

  constructor({
    name,
    message,
    code = 'APP_ERROR',
    status = 500,
    details = {},
    isOperational = true,
  }: {
    name: string;
    message: string;
    code?: string | number;
    status?: number;
    details?: any;
    isOperational?: boolean;
  }) {
    super(message);
    this.name = name;
    this.code = code;
    this.status = status;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const handleError = (error: unknown, context?: string): void => {
  const errorInfo = getErrorInfo(error, context);
  logError(errorInfo);
  
  // In development, show error alerts
  if (__DEV__) {
    showErrorAlert(errorInfo);
  }
  
  // In production, report to Sentry
  if (!__DEV__) {
    reportErrorToSentry(errorInfo);
  }
};

const getErrorInfo = (error: unknown, context?: string): ErrorInfo => {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  if (typeof error === 'string') {
    return {
      name: 'UnknownError',
      message: error,
    };
  }
  
  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
    details: error,
  };
};

const logError = (errorInfo: ErrorInfo): void => {
  const { name, message, code, status, stack } = errorInfo;
  
  console.error(`[${name}] ${message}`, {
    code,
    status,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...(stack && { stack }),
  });
};

const showErrorAlert = (errorInfo: ErrorInfo): void => {
  const { name, message, code, status } = errorInfo;
  
  Alert.alert(
    `${name}${code ? ` (${code})` : ''}${status ? ` [${status}]` : ''}`,
    message,
    [{ text: 'OK' }]
  );
};

const reportErrorToSentry = (errorInfo: ErrorInfo): void => {
  try {
    Sentry.Native.captureException(new Error(errorInfo.message), {
      tags: {
        name: errorInfo.name,
        code: errorInfo.code,
        status: errorInfo.status,
        platform: Platform.OS,
      },
      extra: {
        details: errorInfo.details,
        stack: errorInfo.stack,
      },
    });
  } catch (sentryError) {
    console.error('Failed to report error to Sentry:', sentryError);
  }
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return undefined;
    }
  };
};
