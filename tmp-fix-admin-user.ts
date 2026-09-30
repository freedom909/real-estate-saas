import AdminUserModel from "./src/core/admin/infrastructure/models/adminUser.model";

const OLD_ID = "6a8da452c73ec83344bab6d8";
const NEW_ID = "6abca74c134bf08fdc5ec2f0";
const EMAIL = "mpeg56@gmail.com";

const transaction = await AdminUserModel.sequelize!.transaction();

try {
  const oldUser = await AdminUserModel.findByPk(OLD_ID, { transaction });
  const newUser = await AdminUserModel.findByPk(NEW_ID, { transaction });

  console.log("=== BEFORE ===");
  console.log("oldUser:", oldUser?.toJSON() ?? null);
  console.log("newUser:", newUser?.toJSON() ?? null);

  if (!oldUser) {
    throw new Error(`Old admin user not found: ${OLD_ID}`);
  }

  if (newUser) {
    throw new Error(
      `New admin user ID already exists: ${NEW_ID}. Aborting.`
    );
  }

  if (oldUser.get("email") !== EMAIL) {
    throw new Error(
      `Email mismatch. Expected ${EMAIL}, got ${oldUser.get("email")}`
    );
  }

  await AdminUserModel.sequelize!.query(
    `
    UPDATE admin_users
    SET id = :newId
    WHERE id = :oldId
    `,
    {
      replacements: {
        oldId: OLD_ID,
        newId: NEW_ID,
      },
      transaction,
    }
  );

  await transaction.commit();

  const fixedUser = await AdminUserModel.findByPk(NEW_ID);

  console.log("=== AFTER ===");
  console.log(fixedUser?.toJSON() ?? null);

  console.log("✅ AdminUser ID fixed successfully.");
} catch (error) {
  await transaction.rollback();

  console.error("❌ Repair failed. Transaction rolled back.");
  console.error(error);

  process.exit(1);
}

process.exit(0);
