// utils/errorHandler.ts
import { toast } from "@/hooks/use-toast";
import { UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR } from "@/utils/errors";

export const handleError = (error: unknown) => {
  let title = "Error";
  let description = "An unexpected error occurred";

  if (error instanceof Error) {
    // Handle authentication errors
    if (error.message === UNAUTHENTICATED_ERROR.data.message) {
      return { shouldShowLogin: true, message: "Please sign in to continue" };
    }

    // Handle authorization errors
    if (error.message === UNAUTHORIZED_ERROR.data.message) {
      title = "Permission Denied";
      description = "You don't have permission to perform this action";
    }

    // Handle validation errors
    else if (error.message.includes("Validation Error")) {
        console.log("error",error)
      title = "Invalid Data";
      description = "Please check your input and try again";
    }

    // Handle database errors
    else if (error.message.includes("Something went wrong")) {
      title = "Operation Failed";
      description = "Could not complete the operation. Please try again";
    }

    // Fallback to the original error message
    else {
      description = error.message;
    }
  }

  // Show toast notification
  toast({
    title,
    description,
    variant: "destructive",
  });

  // For debugging purposes
  console.error("Error:", error);

  return { shouldShowLogin: false };
};