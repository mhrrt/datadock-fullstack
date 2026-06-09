export type CustomerStatus = "ACTIVE" | "RESTRICTED" | "INACTIVE";

export interface StatusResult {
  status: CustomerStatus;
  outstandingAmount: number;
}

export function calculateStatus(
  pendingAmount: number,
  receivedAmount: number,
): StatusResult {
  const outstandingAmount = pendingAmount - receivedAmount;

  let status: CustomerStatus = "ACTIVE";

  if (pendingAmount > 0) {
    if (receivedAmount === 0) {
      status = "INACTIVE";
    } else if (outstandingAmount > 0) {
      status = "RESTRICTED";
    }
  }

  return {
    status,
    outstandingAmount,
  };
}

export function validateRecoveryAmounts(
  pendingAmount: number,
  receivedAmount: number,
): void {
  if (pendingAmount < 0) {
    throw new Error("Pending amount cannot be negative");
  }

  if (receivedAmount < 0) {
    throw new Error("Received amount cannot be negative");
  }

  if (receivedAmount > pendingAmount) {
    throw new Error("Received amount cannot exceed pending amount");
  }
}
