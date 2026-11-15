-- SPDX-FileCopyrightText: 2026 CommuneOS Contributors
-- SPDX-License-Identifier: Apache-2.0
-- Migration: Thêm cột hồ sơ cá nhân vào staff và bảng profile_change_requests

-- Thêm cột mới vào bảng staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS manager_code VARCHAR(100);

-- Cập nhật role enum để bao gồm 'manager'
ALTER TABLE staff ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR(20);

-- Tạo bảng yêu cầu thay đổi hồ sơ cá nhân
CREATE TABLE IF NOT EXISTS profile_change_requests (
  id VARCHAR(100) PRIMARY KEY,
  staff_id VARCHAR(100) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  field VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at TIMESTAMP NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(100),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_profile_change_requests_staff_id ON profile_change_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_status ON profile_change_requests(status);
