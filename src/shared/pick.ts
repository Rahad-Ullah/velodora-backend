const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) => {
  const finalObj: Partial<T> = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

export default pick;
