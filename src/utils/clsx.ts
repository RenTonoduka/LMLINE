// Simple clsx implementation for className conditional logic
type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;

function toVal(mix: ClassValue): string {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let i = 0; i < mix.length; i++) {
        if (mix[i]) {
          const val = toVal(mix[i]);
          if (val) {
            str && (str += ' ');
            str += val;
          }
        }
      }
    } else if (mix) {
      for (const key in mix) {
        if (mix[key]) {
          str && (str += ' ');
          str += key;
        }
      }
    }
  }

  return str;
}

export function clsx(...inputs: ClassValue[]): string {
  let i = 0;
  let tmp: ClassValue;
  let str = '';

  while (i < inputs.length) {
    tmp = inputs[i++];
    if (tmp) {
      const val = toVal(tmp);
      if (val) {
        str && (str += ' ');
        str += val;
      }
    }
  }

  return str;
}