ALTER TABLE "Users"
ADD CONSTRAINT "role_check"
CHECK ("role" IN ('Admin', 'User'));