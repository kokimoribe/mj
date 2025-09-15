/**
 * Scoring Section Component
 *
 * Handles the scoring configuration section of the configuration panel.
 * Manages Uma values, starting score, and return score settings.
 */

import { CONFIG_CONSTRAINTS } from "@/core/validation";

interface ScoringSectionProps {
  data: {
    uma: [number, number, number, number];
    startingScore: number;
    returnScore: number;
  };
  onChange: (field: string, value: unknown) => void;
  validationError?: string | null;
}

export function ScoringSection({
  data,
  onChange,
  validationError,
}: ScoringSectionProps) {
  const handleUmaChange = (index: number, value: string) => {
    const newUma = [...data.uma] as [number, number, number, number];
    newUma[index] = parseInt(value) || 0;
    onChange("uma", newUma);
  };

  return (
    <div className="space-y-3 border-t p-3">
      {/* Uma Values */}
      <div>
        <label className="text-sm">
          Uma (Bonus/Penalty)
          <span className="text-muted-foreground ml-1 text-xs">
            {CONFIG_CONSTRAINTS.uma.tooltip}
          </span>
        </label>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {data.uma.map((value, index) => (
            <div key={index}>
              <label className="text-muted-foreground text-xs">
                {["1st", "2nd", "3rd", "4th"][index]}
              </label>
              <input
                type="number"
                value={value}
                onChange={e => handleUmaChange(index, e.target.value)}
                className="bg-secondary w-full rounded px-2 py-1 text-sm"
                step={CONFIG_CONSTRAINTS.uma.step}
                min={CONFIG_CONSTRAINTS.uma.min}
                max={CONFIG_CONSTRAINTS.uma.max}
              />
            </div>
          ))}
        </div>
        {validationError && (
          <p className="text-destructive mt-1 text-xs">{validationError}</p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          Sum: {data.uma.reduce((a, b) => a + b, 0)} (must equal 0)
        </p>
      </div>

      {/* Starting Score */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">
            Starting Score
            <span className="text-muted-foreground ml-1 text-xs">
              {CONFIG_CONSTRAINTS.startingScore.tooltip}
            </span>
          </label>
          <input
            type="number"
            value={data.startingScore}
            onChange={e =>
              onChange("startingScore", parseInt(e.target.value) || 0)
            }
            className="bg-secondary mt-1 w-full rounded px-2 py-1 text-sm"
            step={CONFIG_CONSTRAINTS.startingScore.step}
            min={CONFIG_CONSTRAINTS.startingScore.min}
            max={CONFIG_CONSTRAINTS.startingScore.max}
          />
        </div>

        {/* Return Score */}
        <div>
          <label className="text-sm">
            Return Score
            <span className="text-muted-foreground ml-1 text-xs">
              {CONFIG_CONSTRAINTS.returnScore.tooltip}
            </span>
          </label>
          <input
            type="number"
            value={data.returnScore}
            onChange={e =>
              onChange("returnScore", parseInt(e.target.value) || 0)
            }
            className="bg-secondary mt-1 w-full rounded px-2 py-1 text-sm"
            step={CONFIG_CONSTRAINTS.returnScore.step}
            min={CONFIG_CONSTRAINTS.returnScore.min}
            max={CONFIG_CONSTRAINTS.returnScore.max}
          />
        </div>
      </div>
    </div>
  );
}
