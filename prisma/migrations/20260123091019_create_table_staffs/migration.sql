-- CreateTable
CREATE TABLE "Staffs" (
    "id" VARCHAR(255) NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staffs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
