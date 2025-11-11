export const cleanMathText = (value: any): string => {
  if (typeof value !== 'string') {
    return typeof value === 'number' ? value.toString() : '';
  }

  const currencyPlaceholder = '¤';

  let text = value.replace(/\$(?=\d)/g, currencyPlaceholder);

  text = text
    .replace(/\$/g, '')
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1/$2)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\lt/g, '<')
    .replace(/\\gt/g, '>')
    .replace(/\\left|\\right|\\!/g, '')
    .replace(/\^{\s*([^}]+)\s*}/g, '^$1')
    .replace(/_\{\s*([^}]+)\s*}/g, '_$1')
    .replace(/\\sqrt{([^}]+)}/g, '√($1)')
    .replace(/sqrt{([^}]+)}/g, '√($1)')
    .replace(/\\pi/g, 'π')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.replace(new RegExp(currencyPlaceholder, 'g'), '$');
};

