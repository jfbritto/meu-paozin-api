import { applyDecorators, UsePipes } from '@nestjs/common';
import { MoneyFormatPipe } from '../pipes/money-format.pipe';

export function MoneyFormat() {
  return applyDecorators(
    UsePipes(MoneyFormatPipe)
  );
} 