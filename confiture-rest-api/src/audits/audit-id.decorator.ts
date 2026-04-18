import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const AuditId = createParamDecorator(
  async (data: string = "uniqueId", ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const uniqueId = request.params[data];
    // console.log("audit-decorator", uniqueId);

    // const method = ctx.getHandler();

    // const keys = Reflect.getMetadataKeys(method);
    // for (const key of keys) {
    //   console.log("decorator metadata", key, Reflect.getMetadata(key, method));
    // }

    return uniqueId;
  },
  [(target: object, propertyKey: string | symbol | undefined, _parameterIndex: number) => {
    // console.log({ target, propertyKey, parameterIndex });
    // console.log(target);
    const API_RESPONSE = "swagger/apiResponse";
    const responses = Reflect.getMetadata(API_RESPONSE, target[propertyKey]);
    // const keys = Reflect.getMetadataKeys(target[propertyKey]);
    // console.log({ keys });
    // console.log({ responses });

    Reflect.defineMetadata(API_RESPONSE, {
      ...responses,
      410: { description: "The audit has been previously deleted." },
      404: { description: "The audit does not exist." }
    }, target[propertyKey]);
  }]
);
