export class ValidationError extends Error {}
const numericRegex = /^\d+$/.compile();

export function isNonEmptyString(input: any): input is string {
  return typeof input === 'string' && (input as string).length > 0;
}

export function checkNonEmptyStringProperty(input: any, key: string): string {
  const value = input[key];
  if (isNonEmptyString(value)) {
    return value;
  }

  throw new ValidationError(
    `Property "${key}" must be a non-empty string but received "${value}".`
  );
}

export function checkNotNull<T>(input: T | null | undefined): T {
  if (input == null) {
    throw new ValidationError('Can not be null.');
  }
  return input;
}

export function checkIsArray<T>(input: any): Array<T> {
  if (Array.isArray(input)) {
    return input as Array<T>;
  }
  throw new ValidationError('Expected array.');
}

export function isDatelike(input: any): input is number | string | Date {
  return (
    typeof input === 'string' ||
    typeof input === 'number' ||
    input instanceof Date
  );
}

export function isIntegerParseable(input: any): input is string {
  return typeof input === 'string' && numericRegex.test(input as string);
}

export function checkDatelikeProperty(
  input: any,
  key: string
): number | string | Date {
  const value = input[key];
  if (isDatelike(value)) {
    return value;
  }

  throw new ValidationError(
    `Property "${key}" must be one of (number | string | Date), but received "${value}".`
  );
}
