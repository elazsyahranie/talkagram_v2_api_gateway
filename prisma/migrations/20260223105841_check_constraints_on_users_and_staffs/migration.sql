ALTER TABLE "Users" DROP CONSTRAINT role_check;

ALTER TABLE "Users" ADD CONSTRAINT role_check CHECK (role IN ('Super Admin', 'User'));

ALTER TABLE "Staffs" ADD CONSTRAINT role_check CHECK (role IN ('Admin', 'User'));

