require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Prisma 7 setup with PostgreSQL driver
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Create an initial invoice with nested line items
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      customerName: 'Tech Innovators Inc.',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Due in 30 days
      status: 'DRAFT',
      total: 1500, 
      amountPaid: 0,
      balanceDue: 1500,
      isArchived: false,
      lineItems: {
        create: [
          {
            description: 'Full Stack Setup',
            quantity: 10,
            unitPrice: 100,
            lineTotal: 1000, 
          },
          {
            description: 'Database Architecture',
            quantity: 5,
            unitPrice: 100,
            lineTotal: 500,  
          },
        ],
      },
    },
  });

  console.log('Successfully created test invoice:', invoice.invoiceNumber);
  console.log('Invoice ID for testing:', invoice.id);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });