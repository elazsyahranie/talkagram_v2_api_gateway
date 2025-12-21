-- DropForeignKey
ALTER TABLE "Companies" DROP CONSTRAINT "Companies_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserImages" DROP CONSTRAINT "UserImages_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Companies" ADD CONSTRAINT "Companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImages" ADD CONSTRAINT "UserImages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
