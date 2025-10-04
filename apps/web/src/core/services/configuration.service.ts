/**
 * Configuration Service
 *
 * Business logic for rating configuration management.
 * Handles configuration creation, validation, and materialization.
 */

import { BaseService } from "./base.service";
import { createClient } from "@/lib/supabase/server";
import { validateRatingConfiguration } from "@/core/validation";
import type { RatingConfiguration } from "@/stores/configStore";

export interface ConfigurationWithHash {
  hash: string;
  name: string;
  data: RatingConfiguration;
  created_at?: string;
  is_official?: boolean;
  is_active?: boolean;
}

export class ConfigurationService extends BaseService {
  constructor() {
    super("ConfigurationService");
  }

  /**
   * Generate hash for a configuration
   */
  private generateConfigHash(config: RatingConfiguration): string {
    // Simple hash generation - in production, use a proper hashing algorithm
    const configString = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate a configuration
   */
  validateConfiguration(config: RatingConfiguration): {
    isValid: boolean;
    errors: string[];
  } {
    return validateRatingConfiguration(config);
  }

  /**
   * Get all official configurations
   */
  async getOfficialConfigurations(): Promise<ConfigurationWithHash[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("rating_configurations")
        .select("*")
        .eq("is_official", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch official configurations", error);
        return [];
      }

      return (
        data?.map(config => ({
          hash: config.config_hash,
          name: config.name,
          data: config.configuration,
          created_at: config.created_at,
          is_official: true,
          is_active: config.is_active,
        })) || []
      );
    } catch (error) {
      console.error("Error in getOfficialConfigurations", error);
      return [];
    }
  }

  /**
   * Get user's custom configurations
   */
  async getCustomConfigurations(
    userId?: string
  ): Promise<ConfigurationWithHash[]> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from("rating_configurations")
        .select("*")
        .eq("is_official", false)
        .order("created_at", { ascending: false });

      // If userId provided, filter by user
      if (userId) {
        query = query.eq("created_by", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch custom configurations", error);
        return [];
      }

      return (
        data?.map(config => ({
          hash: config.config_hash,
          name: config.name,
          data: config.configuration,
          created_at: config.created_at,
          is_official: false,
          is_active: config.is_active,
        })) || []
      );
    } catch (error) {
      console.error("Error in getCustomConfigurations", error);
      return [];
    }
  }

  /**
   * Save a new configuration
   */
  async saveConfiguration(
    name: string,
    config: RatingConfiguration,
    userId?: string
  ): Promise<ConfigurationWithHash | null> {
    try {
      // Validate configuration first
      const validation = this.validateConfiguration(config);
      if (!validation.isValid) {
        console.error("Invalid configuration", validation.errors);
        return null;
      }

      const supabase = await createClient();
      const hash = this.generateConfigHash(config);

      // Check if configuration already exists
      const { data: existing } = await supabase
        .from("rating_configurations")
        .select("*")
        .eq("config_hash", hash)
        .single();

      if (existing) {
        return {
          hash: existing.config_hash,
          name: existing.name,
          data: existing.configuration,
          created_at: existing.created_at,
          is_official: existing.is_official,
          is_active: existing.is_active,
        };
      }

      // Save new configuration
      const { data, error } = await supabase
        .from("rating_configurations")
        .insert({
          config_hash: hash,
          name,
          configuration: config,
          is_official: false,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to save configuration", error);
        return null;
      }

      return {
        hash: data.config_hash,
        name: data.name,
        data: data.configuration,
        created_at: data.created_at,
        is_official: false,
        is_active: false,
      };
    } catch (error) {
      console.error("Error in saveConfiguration", error);
      return null;
    }
  }

  /**
   * Trigger materialization for a configuration
   */
  async triggerMaterialization(
    configHash: string,
    config: RatingConfiguration
  ): Promise<boolean> {
    try {
      // Call the Python rating engine API
      const response = await fetch("/api/materialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config_hash: configHash,
          configuration: config,
        }),
      });

      if (!response.ok) {
        console.error("Materialization failed", await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error triggering materialization", error);
      return false;
    }
  }

  /**
   * Check if data is available for a configuration
   */
  async checkDataAvailability(configHash: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("cached_player_ratings")
        .select("id")
        .eq("config_hash", configHash)
        .limit(1)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error("Error checking data availability", error);
      return false;
    }
  }

  /**
   * Get active configuration
   */
  async getActiveConfiguration(): Promise<ConfigurationWithHash | null> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("rating_configurations")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        hash: data.config_hash,
        name: data.name,
        data: data.configuration,
        created_at: data.created_at,
        is_official: data.is_official,
        is_active: true,
      };
    } catch (error) {
      console.error("Error getting active configuration", error);
      return null;
    }
  }
}

// Export singleton instance
export const configurationService = new ConfigurationService();
