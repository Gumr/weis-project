import { isNum } from './validator';

function isDigitInput(input: string) {
  return new RegExp('^Digit').test(input);
}

const isNormalKey = (key: string) => ['ArrowLeft', 'ArrowRight', 'Backspace', 'Tab'].includes(key);
const isNonNumberKey = (key: string) => !isNum(key) && !isDigitInput(key) && !isNormalKey(key);

const isPeriod = (key: string) => key === '.';

const isNonInt = (key: string) => !isPeriod(key) && isNonNumberKey(key);

export function catchNonIntKeydown(evt: KeyboardEvent) {
  const { key } = evt;
  if (isNonNumberKey(key)) {
    evt.preventDefault();
  }
}
export function catchNonNumberKeydown(evt: KeyboardEvent) {
  const { key } = evt;

  if (isNonInt(key)) {
    evt.preventDefault();
  }
}

export const DecimalRegExp = /^(\d+)(\.\d?)?/;
