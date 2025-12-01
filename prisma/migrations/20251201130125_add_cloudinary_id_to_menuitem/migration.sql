-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "cloudinaryId" TEXT,
ALTER COLUMN "imageId" DROP NOT NULL;
