import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@algorhythm.com' },
    update: {},
    create: {
      email: 'admin@algorhythm.com',
      passwordHash: adminPasswordHash,
      name: 'Super Admin',
      role: "SUPER_ADMIN",
    },
  })
  console.log('Created Admin user: admin@algorhythm.com / admin123')

  // Check if settings exist
  const existingSettings = await prisma.websiteSettings.findFirst()
  if (!existingSettings) {
    // 2. Create Website Settings
    await prisma.websiteSettings.create({
      data: {
        clubName: 'AlgoRhythm Club',
        description: 'Technical Club of IT Department, GVPIHLR',
        whatsappUrl: 'https://whatsapp.com',
        instagramUrl: 'https://instagram.com',
        linkedinUrl: 'https://linkedin.com',
        footerText: '© 2026 AlgoRhythm Club, GVPIHLR',
      },
    })
    console.log('Created Website Settings')
  }

  const existingMembers = await prisma.teamMember.count()
  if (existingMembers === 0) {
    // 3. Create Sample Team Members
    await prisma.teamMember.createMany({
      data: [
        {
          name: 'Sample Founder',
          position: 'Founder',
          category: "FOUNDER",
          academicYear: '2023-2027',
        },
        {
          name: 'Sample Student 1',
          position: 'President',
          category: "BOARD_26_27",
          academicYear: '2024-2028',
        },
        {
          name: 'Sample Faculty',
          position: 'Coordinator',
          category: "FACULTY",
          designation: 'Assistant Professor',
        },
      ],
    })
    console.log('Created Team Members')
  }

  const existingEvents = await prisma.event.count()
  if (existingEvents === 0) {
    // 4. Create Sample Events
    await prisma.event.create({
      data: {
        title: 'AlgoHack 2026',
        slug: 'algohack-2026',
        startDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        shortOverview: 'A 24-hour hackathon for student innovators.',
        detailedDescription: 'Join us for our flagship hackathon event. Build amazing projects, learn new skills, and compete for prizes!',
        status: "UPCOMING",
        registrationStatus: "OPEN",
        googleFormUrl: 'https://forms.google.com/sample',
      },
    })
    console.log('Created Events')
  }

  const existingMagazines = await prisma.magazine.count()
  if (existingMagazines === 0) {
    // 5. Create Sample Magazines
    await prisma.magazine.create({
      data: {
        title: 'TechBytes Issue #1',
        month: 'September',
        year: '2026',
        pdfUrl: '/placeholder.pdf',
      },
    })
    console.log('Created Magazines')
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
