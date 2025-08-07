import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class MoneyFormatPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      return value;
    }

    // Se for string, converter para número
    if (typeof value === 'string') {
      // Remover todos os caracteres não numéricos exceto vírgula e ponto
      let cleanValue = value.replace(/[^\d,.-]/g, '');
      
      // Se tiver vírgula, assumir que é separador decimal (formato brasileiro)
      if (cleanValue.includes(',')) {
        // Se tiver ponto também, remover o ponto (ex: 1.234,56)
        if (cleanValue.includes('.')) {
          cleanValue = cleanValue.replace(/\./g, '');
        }
        // Substituir vírgula por ponto
        cleanValue = cleanValue.replace(',', '.');
      }
      
      // Converter para número
      const numericValue = parseFloat(cleanValue);
      
      // Verificar se é um número válido
      if (isNaN(numericValue)) {
        throw new Error('Valor monetário inválido');
      }
      
      return numericValue;
    }

    // Se já for número, retornar como está
    if (typeof value === 'number') {
      return value;
    }

    return value;
  }
} 