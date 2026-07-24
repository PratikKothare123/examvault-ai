const sanitizeValue = (data) => {
  if (typeof data === 'string') {
    // Strip HTML script tags and HTML elements
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '');
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeValue(item));
  }

  if (data !== null && typeof data === 'object') {
    const cleanObject = {};
    for (const key of Object.keys(data)) {
      // Strip keys starting with $ or containing . (NoSQL Injection Operators)
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObject[key] = sanitizeValue(data[key]);
    }
    return cleanObject;
  }

  return data;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
