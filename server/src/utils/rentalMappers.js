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

const mapRentalRecord = (record) => ({
  id: record.id,
  userId: record.user_id,
  productId: record.product_id,
  startDate: record.start_date,
  endDate: record.end_date,
  status: record.status,
  totalAmount: record.total_amount ? Number(record.total_amount) : 0,
  paymentIntentId: record.payment_intent_id,
  deliveryAddress: record.delivery_address || '',
  contactPhone: record.contact_phone || '',
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  product: normalizeProduct(record),
  customer: normalizeCustomer(record),
});

module.exports = {
  mapRentalRecord,
};

