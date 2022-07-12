import { render } from "@testing-library/vue";

import Audit from "./Audit.vue";
import { Audit as AuditType } from "../types";

describe("Audit component", () => {
  it("renders correctly", () => {
    const mockAudit: AuditType = {
      id: 1,
      procedure: "Ma procédure",
      uniqueId: "lsdkfjosqdifj",
    };

    const { getByText } = render(Audit, {
      props: {
        audit: mockAudit,
      },
    });

    expect(getByText("An audit of Ma procédure.")).toBeInTheDocument();
  });
});
