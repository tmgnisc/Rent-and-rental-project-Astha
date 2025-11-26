const { mapRentalRecord } = require('./rentalMappers');

const buildReturnsQuery = `
  SELECT 
    r.*,
    p.name AS product_name,
    p.image_url AS product_image,
    p.category AS product_category,
    p.vendor_name AS product_vendor_name,
    u.name AS customer_name,
    u.email AS customer_email,
    v.name AS vendor_name_internal,
    v.email AS vendor_email
   FROM rentals r
   INNER JOIN products p ON p.id = r.product_id
   INNER JOIN users u ON u.id = r.user_id
   INNER JOIN users v ON v.id = p.vendor_id
`;

const mapReturnRecords = (rows) =>
  rows.map((record) =>
    mapRentalRecord({
      ...record,
      vendor_name: record.vendor_name_internal || record.product_vendor_name,
    })
  );

module.exports = {
  buildReturnsQuery,
  mapReturnRecords,
};

