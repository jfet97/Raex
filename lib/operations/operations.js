import {Let} from '../index';

export class Operations {
  static add(...lets) {
    const sum = lets.reduce((acc, aLet) => (acc += aLet.value), 0);
    const newLet = Let(sum);

    lets.forEach(aLet => {
      aLet.addConsumer(newLet);
    });
    newLet.addDependencies(...lets);
    newLet.setOperator('+');

    return newLet;
  }

  static mult(...lets) {
    const tot = lets.reduce((acc, aLet) => (acc *= aLet.value), 1);
    const newLet = Let(tot);

    lets.forEach(aLet => {
      aLet.addConsumer(newLet);
    });
    newLet.addDependencies(...lets);
    newLet.setOperator('*');

    return newLet;
  }

  static sub(let1, let2) {
    const res = let1.value - let2.value;
    const newLet = Let(res);

    let1.addConsumer(newLet);
    let2.addConsumer(newLet);
    newLet.addDependencies(let1, let2);
    newLet.setOperator('-');

    return newLet;
  }

  static div(let1, let2) {
    const res = let1.value / let2.value;
    const newLet = Let(res);

    let1.addConsumer(newLet);
    let2.addConsumer(newLet);
    newLet.addDependencies(let1, let2);
    newLet.setOperator('/');

    return newLet;
  }

  static mod(let1, let2) {
    const res = let1.value % let2.value;
    const newLet = Let(res);

    let1.addConsumer(newLet);
    let2.addConsumer(newLet);
    newLet.addDependencies(let1, let2);
    newLet.setOperator('%');

    return newLet;
  }
}