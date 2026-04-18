export const MANUAL_BINANCE_PAY_ID =
  process.env.NEXT_PUBLIC_BINANCE_PAY_ID?.trim() || "380122891";

export const MANUAL_BINANCE_PAY_EMAIL =
  process.env.NEXT_PUBLIC_BINANCE_PAY_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_BINANCE_EMAIL?.trim() ||
  "yoshuasoto54@gmail.com";

export const MANUAL_BINANCE_PAY_QR_URL =
  process.env.NEXT_PUBLIC_BINANCE_PAY_QR_URL?.trim() || "/binance-pay-qr.png";

export const MANUAL_PENDING_VERIFICATION_STATUS = "submitted";
export const MANUAL_PAID_STATUS = "verified";
