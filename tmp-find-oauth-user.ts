import UserModel from "./src/subgraphs/user/infra/models/user.model";
import connectMongoDB from "./src/infrastructure/config/connectMongoDB";

await connectMongoDB();

const user = await UserModel.findOne({
  email: "mpeg56@gmail.com",
}).lean();

console.log("=== OAUTH USER ===");

if (!user) {
  console.log("User not found");
} else {
  console.log({
    _id: user._id,
    email: user.email,
    globalRole: user.globalRole,
  });
}

process.exit(0);
