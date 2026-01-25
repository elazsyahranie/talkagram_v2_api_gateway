-- CreateTable
CREATE TABLE "StoreImages" (
    "id" VARCHAR(255) NOT NULL,
    "store_id" TEXT NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoreImages" ADD CONSTRAINT "StoreImages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
