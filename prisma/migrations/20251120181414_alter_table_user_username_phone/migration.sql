/*
  Warnings:

  - Added the required column `phone` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "phone" VARCHAR(255) NOT NULL,
ADD COLUMN     "username" VARCHAR(255) NOT NULL;
