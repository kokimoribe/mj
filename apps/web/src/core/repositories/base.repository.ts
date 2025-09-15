/**
 * Base Repository
 *
 * Abstract base class for all repositories. Provides common database
 * operations and error handling.
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export abstract class BaseRepository {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.supabase = createClient();
  }

  /**
   * Handles database errors consistently
   */
  protected handleDatabaseError(error: any, operation: string): never {
    console.error(`[${this.tableName}] Database error in ${operation}:`, error);

    if (error.code === "23505") {
      throw new Error("Duplicate record already exists");
    }

    if (error.code === "23503") {
      throw new Error("Referenced record does not exist");
    }

    if (error.code === "23502") {
      throw new Error("Required field is missing");
    }

    if (error.code === "PGRST116") {
      throw new Error("Record not found");
    }

    throw new Error(error.message || `Database operation failed: ${operation}`);
  }

  /**
   * Executes a database query with error handling
   */
  protected async executeQuery<T>(
    query: Promise<{ data: T | null; error: any }>,
    operation: string
  ): Promise<T> {
    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, operation);
    }

    if (!data) {
      throw new Error(`No data returned from ${operation}`);
    }

    return data;
  }

  /**
   * Executes a database query that may return null
   */
  protected async executeQueryNullable<T>(
    query: Promise<{ data: T | null; error: any }>,
    operation: string
  ): Promise<T | null> {
    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, operation);
    }

    return data;
  }

  /**
   * Builds a query with common filters
   */
  protected buildFilterQuery(query: any, filters: Record<string, any>): any {
    let filteredQuery = query;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "limit") {
          filteredQuery = filteredQuery.limit(value);
        } else if (key === "offset") {
          filteredQuery = filteredQuery.range(
            value,
            value + (filters.limit || 10) - 1
          );
        } else if (Array.isArray(value)) {
          filteredQuery = filteredQuery.in(key, value);
        } else {
          filteredQuery = filteredQuery.eq(key, value);
        }
      }
    });

    return filteredQuery;
  }
}
