export const formatSalary = (salary: string): string => {
  if (!salary) return "Not specified";
  // If salary already contains $ or k, return as is
  if (salary.includes("$") || salary.includes("k") || salary.includes("K"))
    return salary;
  // Try to parse as number and format
  const num = parseFloat(salary);
  if (isNaN(num)) return salary;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
  return `$${num.toFixed(0)}`;
};
