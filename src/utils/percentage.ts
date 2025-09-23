const toPercentage = (value: number): string => {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

export { toPercentage };
