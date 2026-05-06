import { Param } from "@nestjs/common";
import { ApiGoneResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import { AuditExistsPipe } from "./audit.pipe";

function methodDecoratorToParamDecorator(
  decorator: MethodDecorator
): ParameterDecorator {
  return (target: object, propertyKey: string) =>
    decorator(target, propertyKey, { value: target[propertyKey] });
}

/**
 * This decorator can be used to get the URL param corresponding to an audit unique id
 * and check if the audit exists before executing the controller method.
 *
 * If the audit does not exist, a 404 (not found) or a 410 (gone) response is triggered.
 *
 * This decorator also adds descriptions to swagger’s 404 and 410 response documentation.
 *
 * ```typescript
 * getAudit(@AuditId() id: string) {
 *   // here we are assured that the audit exists
 * }
 * ```
 * @param paramName name of the unique id param for the method
 */
export function AuditId(paramName: string = "uniqueId"): ParameterDecorator {
  return (target, propertyKey, index) => {
    [
      Param(paramName, AuditExistsPipe),
      methodDecoratorToParamDecorator(ApiNotFoundResponse({ description: "The audit does not exist." })),
      methodDecoratorToParamDecorator(ApiGoneResponse({ description: "The audit has been previously deleted" }))
    ].forEach(decorator => decorator(target, propertyKey, index));
  };
}
