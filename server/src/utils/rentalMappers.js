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
});

module.exports = {
  mapRentalRecord,
};

