-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "graduated" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_skills" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_registrationNumber_key" ON "students"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "student_skills_studentId_name_key" ON "student_skills"("studentId", "name");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
