
function luhnCheck(digits) {
  const clean = String(digits).replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let d = parseInt(clean[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

module.exports = { luhnCheck };
