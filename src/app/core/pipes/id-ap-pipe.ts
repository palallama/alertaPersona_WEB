import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idAP'
})
export class IdAPPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return `AP-${String(value).padStart(4, '0')}`;
  }

}
