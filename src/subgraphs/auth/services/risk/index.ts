//src/subgraphs/auth/services/risk/index.ts

import * as GeoRiskService from "./geo.detection.service";
import * as LoginRiskService from "./login.risk.service";
import * as RiskPolicyService from "./risk.policy.service";

const RiskService={
    GeoRiskService,
    LoginRiskService,
    RiskPolicyService
}
export default RiskService;