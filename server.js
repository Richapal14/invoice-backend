require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();

// Prisma 7 setup with PostgreSQL driver
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// 1. TEMPORARY: Get All Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const allInvoices = await prisma.invoice.findMany();
    res.json(allInvoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// 2. Get Invoice Details by ID
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lineItems: true,
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// 3. Add Payment
app.post('/api/invoices/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be > 0' });

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new Error('Invoice not found');
      if (amount > invoice.balanceDue) throw new Error('Payment exceeds balance due');

      const payment = await tx.payment.create({ data: { invoiceId: id, amount } });
      const updatedAmountPaid = invoice.amountPaid + amount;
      const updatedBalanceDue = invoice.balanceDue - amount;
      const newStatus = updatedBalanceDue === 0 ? 'PAID' : invoice.status;

      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: { amountPaid: updatedAmountPaid, balanceDue: updatedBalanceDue, status: newStatus }
      });
      return { payment, invoice: updatedInvoice };
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// 4. Archive Invoice
app.post('/api/invoices/archive', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Invoice ID is required' }); // <-- Added validation

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { isArchived: true } // [cite: 73]
    });
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive invoice' });
  }
});

// 5. Restore Invoice
app.post('/api/invoices/restore', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Invoice ID is required' }); // <-- Added validation

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { isArchived: false } // [cite: 76]
    });
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore invoice' });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is now listening on ALL network interfaces at port ${PORT}`);
});