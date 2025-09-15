/**
 * Base Service
 *
 * Abstract base class for all services. Provides common functionality
 * like error handling, logging, and caching.
 */

import { ApiError, ApiResponse } from "@/core/domain/types";

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Wraps a service method with error handling
   */
  protected async handleServiceCall<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      return {
        error: this.handleError(error, operationName),
      };
    }
  }

  /**
   * Standardized error handling
   */
  protected handleError(error: unknown, operation: string): ApiError {
    console.error(`[${this.serviceName}] Error in ${operation}:`, error);

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("PGRST")) {
        // PostgREST error from Supabase
        return {
          code: "DATABASE_ERROR",
          message: "Database operation failed",
          details: error.message,
        };
      }

      if (error.message.includes("fetch")) {
        return {
          code: "NETWORK_ERROR",
          message: "Network request failed",
          details: error.message,
        };
      }

      return {
        code: "SERVICE_ERROR",
        message: error.message,
        details: { service: this.serviceName, operation },
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      details: { service: this.serviceName, operation, error },
    };
  }

  /**
   * Validates required fields are present
   */
  protected validateRequired<T extends object>(
    data: T,
    requiredFields: (keyof T)[]
  ): void {
    const missing = requiredFields.filter(
      field => data[field] === undefined || data[field] === null
    );

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }

  /**
   * Safely parses JSON with error handling
   */
  protected safeJsonParse<T>(json: string, fallback: T): T {
    try {
      return JSON.parse(json) as T;
    } catch {
      console.warn(
        `[${this.serviceName}] Failed to parse JSON, using fallback`
      );
      return fallback;
    }
  }
}
