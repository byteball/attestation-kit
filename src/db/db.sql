CREATE TABLE IF NOT EXISTS ATTESTATION_KIT_attestations (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_wallet_address CHAR(32) NULL CHECK(user_wallet_address IS NULL OR length(user_wallet_address) = 32),
    user_device_address CHAR(32) NULL,

    dataKey0 VARCHAR(44) NULL, -- Platform-specific data key
    dataValue0 VARCHAR(44) NULL, -- Platform-specific data value

    dataKey1 VARCHAR(44) NULL, -- Platform-specific data key
    dataValue1 VARCHAR(44) NULL, -- Platform-specific data value

    dataKey2 VARCHAR(44) NULL, -- Platform-specific data key
    dataValue2 VARCHAR(44) NULL, -- Platform-specific data value

    dataKey3 VARCHAR(44) NULL, -- Platform-specific data key
    dataValue3 VARCHAR(44) NULL, -- Platform-specific data value

    status TEXT NOT NULL DEFAULT 'pending' CHECK(LOWER(status) IN ('pending', 'addressed', 'verified', 'attested', 'rejected')),
    unit CHAR(44) NULL, -- only for attested statuses
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- query separator
CREATE INDEX IF NOT EXISTS ATTESTATION_KIT_idx_attestations_user ON ATTESTATION_KIT_attestations(user_wallet_address);

-- query separator
CREATE INDEX IF NOT EXISTS ATTESTATION_KIT_idx_attestations_status ON ATTESTATION_KIT_attestations(status);

-- query separator
CREATE UNIQUE INDEX IF NOT EXISTS ATTESTATION_KIT_idx_unit_unique ON ATTESTATION_KIT_attestations(unit) WHERE unit IS NOT NULL;