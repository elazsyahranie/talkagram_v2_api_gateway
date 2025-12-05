ALTER TABLE "UserImages"
ADD CONSTRAINT "type_check"
CHECK ("type" IN ('Profile', 'Header'));