const mapProductRecord = (record) => ({
  id: record.id,
  name: record.name,
  description: record.description || '',
  category: record.category,
  image: record.image_url || '',
  rentalPricePerDay: Number(record.rental_price_per_day),
  refundableDeposit: Number(record.refundable_deposit),
  status: record.status,
  vendor: {
    id: record.vendor_id || '',
    name: record.vendor_name || '',
    rating: record.vendor_rating ? Number(record.vendor_rating) : 0,
  },
  specifications: record.specifications ? (typeof record.specifications === 'string' ? JSON.parse(record.specifications) : record.specifications) : {},
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

module.exports = {
  mapProductRecord,
};

