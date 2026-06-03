export function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function getOtpExpiry(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isOtpExpired(expiry) {
  if (!expiry) return true;
  return new Date() > new Date(expiry);
}
