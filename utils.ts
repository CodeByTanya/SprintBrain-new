
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error';

  // If it's already a string, return it
  if (typeof error === 'string') return error;

  // If it's a standard Error object
  if (error instanceof Error) return error.message;

  // If it's an object-like thing (Supabase errors, etc.)
  if (typeof error === 'object') {
    const err = error as any;

    // Check for standard 'message' property
    if (err.message) {
      // Sometimes message itself is an object or array in some APIs
      return typeof err.message === 'string' 
        ? err.message 
        : JSON.stringify(err.message);
    }

    // Supabase specific error fields
    if (err.error_description) return err.error_description;
    if (err.details) return err.details;
    if (err.hint) return err.hint;

    // Last resort: stringify the object
    try {
      return JSON.stringify(error);
    } catch {
      return '[Complex Object Error]';
    }
  }

  return String(error);
};
