import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   *    ValidationArguments properties
   *
   *    1. value -> 검증되고있는 값 (입력된 값)
   *    2. constraints -> 파라미터에 입력된 제한 사항들
   *       example)
   *       args.constraints[0] -> 3
   *       args.constraints[1] -> 20
   *
   *    3. targetName -> 검증하고 있는 클래스 이름
   *    4. object -> 검증하고 있는 객체
   *    5. property -> 검증되고 있는 객체의 프로퍼티 이름
   *
   */
  if (args.constraints.length === 2) {
    return `Please enter a ${args.property} between ${args.constraints[0]} and ${args.constraints[1]} character.`;
  }
  return `Please enter a ${args.property} at least ${args.constraints[0]} character`;
};
