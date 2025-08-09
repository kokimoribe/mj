"use client";

import { useState, useEffect } from "react";
import { useConfigStore } from "@/stores/configStore";
import { useConfigParams } from "@/hooks/useConfigParams";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RatingConfiguration } from "@/stores/configStore";

interface ConfigurationPanelProps {
  isExpanded: boolean;
}

export function ConfigurationPanel({ isExpanded }: ConfigurationPanelProps) {
  const {
    activeConfig,
    officialConfigs,
    customConfigs,
    isLoading,
    error,
    materializationStatus,
    loadOfficialConfigs,
    setActiveConfig,
    saveCustomConfig,
    triggerMaterialization,
    checkDataAvailability,
  } = useConfigStore();

  const { updateURLConfig } = useConfigParams();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<RatingConfiguration | null>(null);
  const [configName, setConfigName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load official configs on mount
  useEffect(() => {
    if (officialConfigs.length === 0) {
      loadOfficialConfigs();
    }
  }, [loadOfficialConfigs, officialConfigs.length]);

  // Initialize form data when creating new or when active config changes
  useEffect(() => {
    if (isCreatingNew && activeConfig) {
      setFormData(activeConfig.data);
      setConfigName(`${activeConfig.name} (Modified)`);
    }
  }, [isCreatingNew, activeConfig]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const validateUmaValues = (uma: number[]): boolean => {
    const sum = uma.reduce((acc, val) => acc + val, 0);
    return sum === 0;
  };

  const handleFormChange = (section: string, field: string, value: unknown) => {
    if (!formData) return;

    const newFormData = { ...formData };

    if (section === "timeRange") {
      newFormData.timeRange = { ...formData.timeRange, [field]: value };
    } else if (section === "rating") {
      newFormData.rating = { ...formData.rating, [field]: value };
    } else if (section === "scoring") {
      if (field === "uma") {
        const umaValue = value as [number, number, number, number];
        newFormData.scoring = { ...formData.scoring, uma: umaValue };
        if (!validateUmaValues(umaValue)) {
          setValidationError("Uma values must sum to zero");
        } else {
          setValidationError(null);
        }
      } else {
        newFormData.scoring = { ...formData.scoring, [field]: value };
      }
    } else if (section === "weights") {
      newFormData.weights = { ...formData.weights, [field]: value };
    } else if (section === "qualification") {
      newFormData.qualification = { ...formData.qualification, [field]: value };
    }

    setFormData(newFormData);
  };

  const handleSelectConfig = async (value: string) => {
    if (value === "create-new") {
      setIsCreatingNew(true);
      return;
    }

    // Parse the value to get hash
    const [hash] = value.split("|");

    // Check if data is available
    const hasData = await checkDataAvailability(hash);

    if (hasData) {
      setActiveConfig(hash);
      updateURLConfig(hash);
      toast.success("Configuration loaded");
    } else {
      // Find the config data
      const officialConfig = officialConfigs.find(c => c.hash === hash);
      const customConfig = customConfigs[hash];
      const config = officialConfig || customConfig;

      if (config) {
        setActiveConfig(hash, config.data, config.name);
        updateURLConfig(hash);
        // Trigger materialization
        await triggerMaterialization(hash, config.data);
      }
    }
  };

  const handleApplyConfig = async () => {
    if (!formData || validationError) return;

    // Save the custom config
    const tempHash = saveCustomConfig(configName, formData);

    // Set it as active immediately
    setActiveConfig(tempHash, formData, configName);
    setIsCreatingNew(false);

    // Wait for the real hash to be generated before triggering materialization
    // The configStore will handle updating from temp to real hash
    setTimeout(async () => {
      // By now, the real hash should be available
      const state = useConfigStore.getState();
      const realConfig = Object.values(state.customConfigs).find(
        c => c.name === configName && c.hash !== tempHash
      );

      if (realConfig) {
        // Update URL with real hash
        updateURLConfig(realConfig.hash);
        // Trigger materialization with real hash
        await triggerMaterialization(realConfig.hash, formData);
      }
    }, 500);
  };

  const handleCancel = () => {
    setIsCreatingNew(false);
    setFormData(null);
    setConfigName("");
    setValidationError(null);
  };

  // Get current materialization status
  const currentMaterializationStatus = activeConfig
    ? materializationStatus[activeConfig.hash]
    : null;

  if (!isExpanded) return null;

  return (
    <div
      className="bg-card animate-in slide-in-from-top-2 mt-2 rounded-lg border p-4"
      data-testid="configuration-panel"
    >
      <h3 className="mb-4 text-lg font-semibold">Configuration</h3>

      {/* Configuration Selector */}
      {!isCreatingNew ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="config-select"
              className="mb-2 block text-sm font-medium"
            >
              Active Configuration
            </label>
            <select
              id="config-select"
              className="bg-background w-full rounded-md border p-2"
              value={
                activeConfig
                  ? `${activeConfig.hash}|${activeConfig.isOfficial}`
                  : ""
              }
              onChange={e => handleSelectConfig(e.target.value)}
              disabled={isLoading}
            >
              {/* Official Configs */}
              {officialConfigs.map(config => (
                <option key={config.hash} value={`${config.hash}|true`}>
                  {config.name} (Official)
                </option>
              ))}

              {/* Custom Configs */}
              {Object.values(customConfigs).map(config => (
                <option key={config.hash} value={`${config.hash}|false`}>
                  {config.name}
                </option>
              ))}

              {/* Separator and Create New */}
              <option disabled>─────────────</option>
              <option value="create-new">Create New Based on Current</option>
            </select>
          </div>

          {/* Show current config details */}
          {activeConfig && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Time Range:</span>
                <span>
                  {activeConfig.data.timeRange.startDate || "All time"} -{" "}
                  {activeConfig.data.timeRange.endDate || "All time"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rating:</span>
                <span>
                  μ={activeConfig.data.rating.initialMu}, σ=
                  {activeConfig.data.rating.initialSigma}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Uma:</span>
                <span>{activeConfig.data.scoring.uma.join(", ")}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Configuration Form */
        <div className="space-y-4">
          <div>
            <label
              htmlFor="config-name"
              className="mb-2 block text-sm font-medium"
            >
              Configuration Name
            </label>
            <input
              id="config-name"
              type="text"
              className="bg-background w-full rounded-md border p-2"
              value={configName}
              onChange={e => setConfigName(e.target.value)}
              placeholder="My Custom Config"
            />
          </div>

          {/* Collapsible Sections */}
          {formData && (
            <div className="space-y-2">
              {/* Time Range Section */}
              <div className="rounded-md border">
                <button
                  className="hover:bg-accent/50 flex w-full items-center justify-between p-3 transition-colors"
                  onClick={() => toggleSection("timeRange")}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {expandedSection === "timeRange" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Time Range
                  </span>
                </button>
                {expandedSection === "timeRange" && (
                  <div className="space-y-3 border-t p-3">
                    <div>
                      <label className="text-sm">Start Date</label>
                      <input
                        type="date"
                        className="bg-background w-full rounded-md border p-2"
                        value={formData.timeRange.startDate || ""}
                        onChange={e =>
                          handleFormChange(
                            "timeRange",
                            "startDate",
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm">End Date</label>
                      <input
                        type="date"
                        className="bg-background w-full rounded-md border p-2"
                        value={formData.timeRange.endDate || ""}
                        onChange={e =>
                          handleFormChange(
                            "timeRange",
                            "endDate",
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          !formData.timeRange.startDate &&
                          !formData.timeRange.endDate
                        }
                        onChange={e => {
                          if (e.target.checked) {
                            handleFormChange("timeRange", "startDate", null);
                            handleFormChange("timeRange", "endDate", null);
                          }
                        }}
                      />
                      <span className="text-sm">Include all games</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Rating Parameters Section */}
              <div className="rounded-md border">
                <button
                  className="hover:bg-accent/50 flex w-full items-center justify-between p-3 transition-colors"
                  onClick={() => toggleSection("rating")}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {expandedSection === "rating" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Rating Parameters
                  </span>
                </button>
                {expandedSection === "rating" && (
                  <div className="space-y-3 border-t p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Initial μ</label>
                        <input
                          type="number"
                          className="bg-background w-full rounded-md border p-2"
                          value={formData.rating.initialMu}
                          onChange={e =>
                            handleFormChange(
                              "rating",
                              "initialMu",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Initial σ</label>
                        <input
                          type="number"
                          className="bg-background w-full rounded-md border p-2"
                          value={formData.rating.initialSigma}
                          onChange={e =>
                            handleFormChange(
                              "rating",
                              "initialSigma",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.001"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Confidence Factor</label>
                        <input
                          type="number"
                          className="bg-background w-full rounded-md border p-2"
                          value={formData.rating.confidenceFactor}
                          onChange={e =>
                            handleFormChange(
                              "rating",
                              "confidenceFactor",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Decay Rate</label>
                        <input
                          type="number"
                          className="bg-background w-full rounded-md border p-2"
                          value={formData.rating.decayRate}
                          onChange={e =>
                            handleFormChange(
                              "rating",
                              "decayRate",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scoring System Section */}
              <div className="rounded-md border">
                <button
                  className="hover:bg-accent/50 flex w-full items-center justify-between p-3 transition-colors"
                  onClick={() => toggleSection("scoring")}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {expandedSection === "scoring" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Scoring System
                  </span>
                </button>
                {expandedSection === "scoring" && (
                  <div className="space-y-3 border-t p-3">
                    <div>
                      <label className="text-sm">Oka</label>
                      <input
                        type="number"
                        className="bg-background w-full rounded-md border p-2"
                        value={formData.scoring.oka}
                        onChange={e =>
                          handleFormChange(
                            "scoring",
                            "oka",
                            parseFloat(e.target.value)
                          )
                        }
                        step="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm">
                        Uma Values (must sum to 0)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.scoring.uma.map((uma, index) => (
                          <input
                            key={index}
                            type="number"
                            className="bg-background rounded-md border p-2"
                            value={uma}
                            onChange={e => {
                              const newUma = [...formData.scoring.uma] as [
                                number,
                                number,
                                number,
                                number,
                              ];
                              newUma[index] = parseFloat(e.target.value) || 0;
                              handleFormChange("scoring", "uma", newUma);
                            }}
                            aria-label={`Uma ${index + 1}`}
                          />
                        ))}
                      </div>
                      {validationError && (
                        <p className="text-destructive mt-1 text-sm">
                          {validationError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Qualification Rules Section */}
              <div className="rounded-md border">
                <button
                  className="hover:bg-accent/50 flex w-full items-center justify-between p-3 transition-colors"
                  onClick={() => toggleSection("qualification")}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {expandedSection === "qualification" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Qualification Rules
                  </span>
                </button>
                {expandedSection === "qualification" && (
                  <div className="space-y-3 border-t p-3">
                    <div>
                      <label className="text-sm">Minimum Games</label>
                      <input
                        type="number"
                        className="bg-background w-full rounded-md border p-2"
                        value={formData.qualification.minGames}
                        onChange={e =>
                          handleFormChange(
                            "qualification",
                            "minGames",
                            parseInt(e.target.value)
                          )
                        }
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Drop Worst Games</label>
                      <input
                        type="number"
                        className="bg-background w-full rounded-md border p-2"
                        value={formData.qualification.dropWorst}
                        onChange={e =>
                          handleFormChange(
                            "qualification",
                            "dropWorst",
                            parseInt(e.target.value)
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="hover:bg-accent rounded-md border px-4 py-2 transition-colors"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className={cn(
                "bg-primary text-primary-foreground rounded-md px-4 py-2 transition-colors",
                validationError
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary/90"
              )}
              onClick={handleApplyConfig}
              disabled={!!validationError || !configName}
            >
              Apply Config
            </button>
          </div>
        </div>
      )}

      {/* Materialization Status */}
      {currentMaterializationStatus?.isLoading && (
        <div className="bg-accent/50 mt-4 flex items-center gap-2 rounded-md p-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Calculating ratings...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-3">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
