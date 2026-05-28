// infrastructure/mappers/trustedDevice.mapper.ts

import { TrustedDevice } from "@/security/domain/entities/trustedDevice.entity";



class TrustedDeviceMapper {
  static toDomain(doc: any): TrustedDevice {
    return new TrustedDevice(
      doc.userId,
      doc.fingerprint,
      doc.createdAt,
      doc.lastUsedAt
    );
  }
}   

export default TrustedDeviceMapper; 