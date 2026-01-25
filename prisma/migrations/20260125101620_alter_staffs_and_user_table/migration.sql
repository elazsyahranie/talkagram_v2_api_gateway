/*
  Warnings:

  - You are about to drop the column `name` on the `Staffs` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Staffs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Staffs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staffs" DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Staffs_user_id_key" ON "Staffs"("user_id");

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
