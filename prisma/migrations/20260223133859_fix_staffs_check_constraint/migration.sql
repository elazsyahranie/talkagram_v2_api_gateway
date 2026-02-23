ALTER TABLE "Staffs" DROP CONSTRAINT role_check;

ALTER TABLE "Staffs" ADD CONSTRAINT role_check CHECK (role IN ('Admin', 'Staff'));

