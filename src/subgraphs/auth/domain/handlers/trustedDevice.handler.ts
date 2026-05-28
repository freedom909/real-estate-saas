// domain/handlers/trustedDevice.handler.ts
export const registerTrustedDeviceHandler = (
  eventBus,
  trustedDeviceRepo
) => {
  eventBus.on("OtpVerifiedEvent", async (event) => {
    await trustedDeviceRepo.create({
      userId: event.userId,
      deviceId: event.deviceId,
      createdAt: new Date(),
      lastUsedAt: new Date()
    });
  });
};