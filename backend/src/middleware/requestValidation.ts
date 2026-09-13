import { AppError } from "./errorHandler.js";

export const assertValid = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new AppError(400, message);
  }
};

export const assertAllowed = (condition: boolean): void => {
  if (!condition) {
    throw new AppError(403, "This request is not allowed.");
  }
};

export const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);