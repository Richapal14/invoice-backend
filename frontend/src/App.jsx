import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, CheckCircle, Download, Clock, LayoutDashboard, Users, Settings, Bell, Hexagon, Mail, Edit, Info } from 'lucide-react';
import './App.css';

function App() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const fetchInvoice = async () => {
    try {
      const listRes = await axios.get('http://localhost:5000/api/invoices');
      if (listRes.data.length > 0) {
        const id = listRes.data[0].id;
        const detailRes = await axios.get(`http://localhost:5000/api/invoices/${id}`);
        setInvoice(detailRes.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || amount > invoice.balanceDue) return;

    setIsPaying(true);
    try {
      await axios.post(`http://localhost:5000/api/invoices/${invoice.id}/payments`, { amount });
      setPaymentAmount('');
      setIsModalOpen(false);
      await fetchInvoice(); 
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const generatePDF = () => window.print();

  // Mock function for buttons outside the assignment scope
  const handleNotImplemented = (feature) => {
    alert(`The "${feature}" feature is outside the scope of this assignment, but it would go here!`);
  };

  if (loading) return <div className="app-layout"><div className="main-content" style={{padding: '40px'}}><h2>Loading Dashboard...</h2></div></div>;
  if (!invoice) return <div className="app-layout"><div className="main-content" style={{padding: '40px'}}><h2>No invoice data found.</h2></div></div>;

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';
  const displayStatus = isOverdue ? 'OVERDUE' : invoice.status;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Hexagon fill="#4f46e5" color="#4f46e5" /> Monefy
        </div>
        <div className="nav-item" onClick={() => handleNotImplemented('Dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
        <div className="nav-item active"><FileText size={20} /> Invoices</div>
        <div className="nav-item" onClick={() => handleNotImplemented('Customers')}><Users size={20} /> Customers</div>
        <div className="nav-item" onClick={() => handleNotImplemented('Settings')}><Settings size={20} /> Settings</div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <Bell size={20} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => handleNotImplemented('Notifications')} />
          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => handleNotImplemented('Profile')}>RP</div>
        </div>

        <div className="dashboard">
          
          {/* TWO-COLUMN GRID STARTS HERE */}
          <div className="dashboard-grid">
            
            {/* COLUMN 1: LEFT SIDE (Main Invoice Details) */}
            <div className="invoice-card">
              <div className="header">
                <div className="title-group">
                  <h1>Invoice {invoice.invoiceNumber}</h1>
                  <p>Issued on {new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div className={`badge ${displayStatus}`}>
                  {displayStatus}
                </div>
              </div>

              <div className="info-grid">
                <div className="info-box">
                  <p>Billed To</p>
                  <h3>{invoice.customerName}</h3>
                </div>
                <div className="info-box">
                  <p>Due Date</p>
                  <h3 style={{ color: isOverdue ? '#991b1b' : 'inherit' }}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </h3>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={18} color="#94a3b8" /> {item.description}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>${item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-notes">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} color="#4f46e5" /> Terms & Conditions
                </h4>
                <p>Please pay within 30 days of receiving this invoice. Payments can be made via credit card, wire transfer, or check. Late payments are subject to a 1.5% monthly penalty.</p>
              </div>
            </div>

            {/* COLUMN 2: RIGHT SIDE (Summary & Actions Panel) */}
            <div className="summary-card">
              
              {/* Actions */}
              <div className="summary-actions">
                <button onClick={generatePDF} className="btn-secondary">
                  <Download size={16} /> Download PDF
                </button>
                <button onClick={() => handleNotImplemented('Edit Invoice')} className="btn-secondary">
                  <Edit size={16} /> Edit Invoice
                </button>
                {invoice.status !== 'PAID' && (
                  <button onClick={() => setIsModalOpen(true)} className="pay-btn" style={{ background: '#4f46e5' }}>
                    <CreditCard size={16} /> Record Payment
                  </button>
                )}
              </div>

              {/* Totals */}
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Summary</h3>
              <div className="totals" style={{ width: '100%', padding: 0, background: 'transparent' }}>
                <div className="total-row"><span>Subtotal</span><span>${invoice.total.toFixed(2)}</span></div>
                <div className="total-row" style={{ color: '#16a34a' }}><span>Amount Paid</span><span>-${invoice.amountPaid.toFixed(2)}</span></div>
                <div className="total-row grand-total"><span>Balance Due</span><span>${invoice.balanceDue.toFixed(2)}</span></div>
              </div>

              {/* Payment History */}
              <div className="payment-section" style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Payment History</h4>
                
                {invoice.payments?.length > 0 ? (
                  <div className="payment-history" style={{ padding: 0, background: 'transparent', marginTop: 0 }}>
                    {invoice.payments.map(payment => (
                      <div key={payment.id} className="payment-item">
                        <span style={{ color: '#64748b', fontSize: '14px' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> 
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                        <span style={{ fontWeight: '600', color: '#16a34a', fontSize: '14px' }}>+ ${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No payments recorded.</p>
                )}

                {invoice.status === 'PAID' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginTop: '20px', background: '#dcfce7', padding: '15px', borderRadius: '12px' }}>
                    <CheckCircle size={20} /> <span style={{ fontWeight: '600' }}>Fully Paid</span>
                  </div>
                )}
              </div>
            </div>

          </div>
          {/* GRID ENDS HERE */}

          {/* Payment Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Record Payment</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Current Balance: ${invoice.balanceDue}</p>
                <form onSubmit={handlePayment}>
                  <input
                    type="number" step="0.01" max={invoice.balanceDue} required
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{ width: '90%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                  />
                  <div className="modal-actions">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                    <button type="submit" className="pay-btn" disabled={isPaying || !paymentAmount}>
                      {isPaying ? 'Processing...' : 'Confirm Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;