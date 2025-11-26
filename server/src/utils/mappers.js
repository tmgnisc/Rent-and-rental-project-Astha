const mapUserRecord = (record) => ({
  id: record.id,
  name: record.name,
  email: record.email,
  role: record.role,
  isVerified: Boolean(record.is_verified),
  vendorDocumentUrl: record.vendor_document_url || null,
  verificationStatus: record.verification_status || null,
  documentVerifiedBy: record.document_verified_by || null,
  kycDocumentUrl: record.kyc_document_url || null,
  kycStatus: record.kyc_status || 'unverified',
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

module.exports = {
  mapUserRecord,
};
