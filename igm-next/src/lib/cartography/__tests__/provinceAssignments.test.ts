import { describe, expect, it } from "vitest";

import { DEPLOYED_PROVINCES_COUNT } from "@/lib/cartography/provinces";
import { getDeployedMapProvinces, mergeDeployedProvinceAssignments } from "@/lib/cartography/provinceAssignments";

describe("mergeDeployedProvinceAssignments", () => {
  it("returns all deployed provinces even when empty", () => {
    const result = mergeDeployedProvinceAssignments([]);
    expect(result).toHaveLength(DEPLOYED_PROVINCES_COUNT);
    expect(result.map((row) => row.province)).toEqual(getDeployedMapProvinces());
    expect(result.every((row) => row.inspectors?.length === 0)).toBe(true);
  });

  it("keeps inspectors for known provinces and ignores undeployed ones", () => {
    const result = mergeDeployedProvinceAssignments([
      {
        province: "Kinshasa",
        inspectors: [{ name: "Jean Inspecteur" }],
      },
      {
        province: "Kwango",
        inspectors: [{ name: "Ne doit pas apparaître" }],
      },
    ]);

    const kinshasa = result.find((row) => row.province === "Kinshasa");
    expect(kinshasa?.inspectors).toEqual([{ name: "Jean Inspecteur" }]);
    expect(result.some((row) => row.province === "Kwango")).toBe(false);
  });
});
