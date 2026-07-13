import { injectable } from "tsyringe";

@injectable()

export class TenantACL {

    async getTenantByUserId(userId: string) {

        // 这里以后调用 tenant-subgraph

        return {

            id: "tenant-" + userId

        };

    }

}