import {_Let} from './let/let';

export {Operations} from './operations/operations';

export const Let = (value) => {
  return new _Let(value);
};