const mapUserRecord = (record) => ({
  id: record.id,
  name: record.name,
  email: record.email,
  role: record.role,
  isVerified: Boolean(record.is_verified),
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

module.exports = {
  mapUserRecord,
};
