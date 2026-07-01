import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { CRITERIA } from "./criteria";

interface ObjectToValidate {
  topic: number | string;
  criterium: number | string;
}

/** Validates the criterium property to make sure the criterium exists in the RGAA. */
export function IsRgaaCriterium(validationOptions?: ValidationOptions) {
  return function (
    object: ObjectToValidate,
    propertyName: string
  ) {
    registerDecorator({
      name: "isRgaaCriterium",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: number | string, args: ValidationArguments) {
          const objectToValidate = args.object as ObjectToValidate;
          const topic = Number(objectToValidate.topic);
          const criterium = Number(value);

          return !!CRITERIA.find(
            (c) => c.criterium === criterium && c.topic === topic
          );
        }
      }
    });
  };
}
