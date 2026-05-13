-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'STANDARD_USER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SUBSTANCE', 'MIXTURE', 'ARTICLE');

-- CreateEnum
CREATE TYPE "DataQualityStatus" AS ENUM ('READY', 'LIMITED', 'INVALID');

-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('MATCH', 'NO_MATCH', 'VERIFICATION_REQUIRED');

-- CreateEnum
CREATE TYPE "MatchedField" AS ENUM ('CAS', 'EC', 'NAME', 'RULE', 'NONE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "dataQualityStatus" "DataQualityStatus" NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Substance" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "casNumber" TEXT,
    "ecNumber" TEXT,
    "concentrationPercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Substance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceListItem" (
    "id" TEXT NOT NULL,
    "referenceListId" TEXT NOT NULL,
    "name" TEXT,
    "casNumber" TEXT,
    "ecNumber" TEXT,

    CONSTRAINT "ReferenceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningRule" (
    "id" TEXT NOT NULL,
    "referenceListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "outcomeStatus" "ScreeningStatus" NOT NULL,

    CONSTRAINT "ScreeningRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessComment" (
    "id" TEXT NOT NULL,
    "referenceListId" TEXT NOT NULL,
    "status" "ScreeningStatus" NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "BusinessComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningResult" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "referenceListId" TEXT NOT NULL,
    "status" "ScreeningStatus" NOT NULL,
    "matchedField" "MatchedField" NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substance" ADD CONSTRAINT "Substance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceListItem" ADD CONSTRAINT "ReferenceListItem_referenceListId_fkey" FOREIGN KEY ("referenceListId") REFERENCES "ReferenceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningRule" ADD CONSTRAINT "ScreeningRule_referenceListId_fkey" FOREIGN KEY ("referenceListId") REFERENCES "ReferenceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessComment" ADD CONSTRAINT "BusinessComment_referenceListId_fkey" FOREIGN KEY ("referenceListId") REFERENCES "ReferenceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningResult" ADD CONSTRAINT "ScreeningResult_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningResult" ADD CONSTRAINT "ScreeningResult_referenceListId_fkey" FOREIGN KEY ("referenceListId") REFERENCES "ReferenceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
