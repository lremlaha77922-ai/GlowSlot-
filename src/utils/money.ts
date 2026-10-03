export const formatMoney = (paise: number): string => {
  const rupees = Math.round(paise / 100);
  return `Rs.${rupees}`;
};

export const calculateTaxes = (subtotalPaise: number, taxPercent: number): number => {
  return Math.round((subtotalPaise * taxPercent) / 100);
};
