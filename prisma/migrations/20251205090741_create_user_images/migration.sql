-- CreateTable
CREATE TABLE "UserImages" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" TEXT NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserImages" ADD CONSTRAINT "UserImages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
