
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";

// security/wrapper/withSecurity.ts
function withSecurity(action: string, resolverFn: any) {
  return async (parent: any, args: any, ctx: any, info: any) => {
    const pipeline = ctx.container.resolve(TOKENS_SECURITY.services.pipeline);

    await pipeline.run(ctx, {
      action,
      payload: args,
    });

    return resolverFn(parent, args, ctx, info);
  };
}

export default withSecurity;

//