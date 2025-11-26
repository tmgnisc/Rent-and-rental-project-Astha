const DAY_IN_MS = 1000 * 60 * 60 * 24;

const normalizeProduct = (record) => {
  if (!record.product_id && !record.productId) {
    return null;
  }

  return {
    id: record.product_id || record.productId,
    name: record.product_name || record.productName || null,
    image: record.product_image || record.productImage || record.image_url || null,
    category: record.product_category || record.productCategory || null,
    vendorName: record.product_vendor_name || record.vendor_name || null,
  };
};

const normalizeCustomer = (record) => {
  if (!record.user_id && !record.userId) {
    return null;
  }

  return {
    id: record.user_id || record.userId,
    name: record.customer_name || record.customerName || record.user_name || null,
    email: record.customer_email || record.customerEmail || record.user_email || null,
  };
};

const calculateRentalFinancials = (record, referenceDate = new Date()) => {
  const dueDate = record.end_date ? new Date(record.end_date) : null;
  const returnedAt = record.returned_at ? new Date(record.returned_at) : null;
  const handedOverAt = record.handed_over_at ? new Date(record.handed_over_at) : null;
  const effectiveReference = returnedAt || referenceDate;

  let overdueDays = 0;
  if (dueDate && effectiveReference > dueDate) {
    overdueDays = Math.ceil((effectiveReference - dueDate) / DAY_IN_MS);
  }

  const dailyFine = Number(record.daily_fine || 100);
  const calculatedFine = Math.max(0, overdueDays) * dailyFine;
  const storedFine = Number(record.fine_amount || 0);

  return {
    dueDate: record.end_date,
    handedOverAt: handedOverAt ? handedOverAt.toISOString() : null,
    returnedAt: returnedAt ? returnedAt.toISOString() : null,
    overdueDays: Math.max(0, overdueDays),
    isOverdue: overdueDays > 0 && !returnedAt,
    dailyFine,
    calculatedFine,
    settledFine: storedFine,
    outstandingFine: returnedAt ? storedFine : calculatedFine,
  };
};

const mapRentalRecord = (record) => {
  const financials = calculateRentalFinancials(record);

  return {
    id: record.id,
    userId: record.user_id,
    productId: record.product_id,
    startDate: record.start_date,
    endDate: record.end_date,
    dueDate: financials.dueDate,
    status: record.status,
    totalAmount: record.total_amount ? Number(record.total_amount) : 0,
    paymentIntentId: record.payment_intent_id,
    deliveryAddress: record.delivery_address || '',
    contactPhone: record.contact_phone || '',
    handedOverAt: financials.handedOverAt,
    returnedAt: financials.returnedAt,
    fineAmount: Number(record.fine_amount || 0),
    dailyFine: financials.dailyFine,
    overdueDays: financials.overdueDays,
    isOverdue: financials.isOverdue,
    outstandingFine: financials.outstandingFine,
  returnRequestNote: record.return_request_note || null,
  returnRequestImage: record.return_request_image || null,
  returnRequestStatus: record.return_request_status || 'none',
  returnRequestedAt: record.return_requested_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    product: normalizeProduct(record),
    customer: normalizeCustomer(record),
  };
};

module.exports = {
  mapRentalRecord,
  calculateRentalFinancials,
};

