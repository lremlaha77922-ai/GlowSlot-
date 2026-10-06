import React, { useState, useEffect } from 'react';
import { bookingService } from '../../features/bookings/services/bookingService';
import { Booking } from '../../types';
import { formatMoney } from '../../utils/money';
import { useSessionStore } from '../../store/useSessionStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  User, 
  Scissors,
  AlertCircle,
  Banknote,
  RotateCcw
} from 'lucide-react';
import { Button } from '../Button';

export const RefundRequestsSummary: React.FC = () => {
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const loadRequests = async () => {
    setLoading(true);
    const list = await bookingService.adminGetRefundRequests();
    setRequests(list);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests.filter(r => {
    if (activeTab === 'pending') return r.cancellation?.refundStatus === 'pending_approval' || r.cancellation?.refundStatus === 'processing';
    return r.cancellation?.refundStatus === 'refunded' || r.cancellation?.refundStatus === 'rejected' || r.cancellation?.refundStatus === 'failed';
  });

  const handleApprove = async (bookingId: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    const res = await bookingService.adminApproveRefund(bookingId, user.id);
    setIsProcessing(false);
    
    if (res.success) {
      showToast(res.message || 'Refund approved and processed');
      setSelectedRequest(null);
      loadRequests();
    } else {
      showToast(res.message || 'Refund failed');
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (!reason) return;

    setIsProcessing(true);
    const res = await bookingService.adminRejectRefund(bookingId, reason);
    setIsProcessing(false);
    
    if (res.success) {
      showToast('Refund request rejected');
      setSelectedRequest(null);
      loadRequests();
    } else {
      showToast(res.error || 'Failed to reject request');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="text-primary" size={18} />
          <h3 className="text-xs font-black uppercase tracking-wider">Refund Requests</h3>
        </div>
        <button onClick={loadRequests} className="p-1.5 rounded-full hover:bg-muted/10">
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 bg-muted/10 rounded-button border border-border">
        {(['pending', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-button transition-all ${
              activeTab === tab ? 'bg-surface text-primary shadow-xs' : 'text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Clock className="animate-spin text-muted" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 opacity-50">
          <Search size={32} className="text-muted" />
          <p className="text-[10px] font-bold uppercase tracking-tight">No {activeTab} requests found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(req => (
            <div 
              key={req.id} 
              className="bg-surface rounded-button border border-border p-3 flex flex-col gap-3 hover:border-primary/40 transition-colors cursor-pointer shadow-xs"
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-muted uppercase">ID: {req.id}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-chip tracking-tighter ${
                  req.cancellation?.refundStatus === 'pending_approval' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  req.cancellation?.refundStatus === 'refunded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {req.cancellation?.refundStatus?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-button bg-primary/5 flex items-center justify-center shrink-0">
                  <User size={20} className="text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-text truncate">{(req as any).customerName || 'Customer'}</h4>
                  <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {req.slot.date} • {req.slot.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-text tabular-nums">{formatMoney(req.cancellation?.refundAmountPaise || 0)}</span>
                  <span className="text-[9px] text-muted block uppercase font-bold">Refund Due</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-bold">
                <span className="text-muted truncate max-w-[140px]">UPI: {req.cancellation?.refundUpiId || 'N/A'}</span>
                <button className="text-primary flex items-center gap-1">Details <ExternalLink size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card border border-border p-5 max-w-sm w-full flex flex-col gap-4 shadow-level-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-tight">Review Refund Request</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-muted hover:text-text">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">Customer</label>
                  <p className="text-xs font-bold">{(selectedRequest as any).customerName || 'N/A'}</p>
                  <p className="text-[10px] text-muted">{(selectedRequest as any).customerPhone || 'No Phone'}</p>
                </div>
                <div className="text-right">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">Salon</label>
                  <p className="text-xs font-bold truncate">{selectedRequest.salonName}</p>
                </div>
              </div>

              <div className="bg-bg rounded-button border border-border p-3 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted uppercase">Advance Paid</span>
                  <span className="text-text font-mono">{formatMoney(selectedRequest.advancePaise || 0)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-error">
                  <span className="uppercase">Cancellation Charge (20%)</span>
                  <span className="font-mono">-{formatMoney((selectedRequest.advancePaise || 0) - (selectedRequest.cancellation?.refundAmountPaise || 0))}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between">
                  <span className="text-xs font-black uppercase text-primary">Refund Amount</span>
                  <span className="text-base font-black text-text tabular-nums">{formatMoney(selectedRequest.cancellation?.refundAmountPaise || 0)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest block">Customer UPI ID</label>
                <div className="bg-primary/5 p-2 rounded-button border border-primary/20 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">{selectedRequest.cancellation?.refundUpiId}</span>
                </div>
              </div>

              {selectedRequest.cancellation?.reason && (
                <div>
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">Cancellation Reason</label>
                  <p className="text-[11px] italic text-muted">"{selectedRequest.cancellation.reason}"</p>
                </div>
              )}
              
              {selectedRequest.cancellation?.refundStatus === 'pending_approval' ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="font-black shadow-md shadow-primary/20"
                    disabled={isProcessing}
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    {isProcessing ? 'Processing...' : `Approve & Refund ${formatMoney(selectedRequest.cancellation?.refundAmountPaise || 0)}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    className="font-bold border-border text-error hover:bg-rose-50"
                    disabled={isProcessing}
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    Reject Request
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
                  {selectedRequest.cancellation?.refundStatus === 'refunded' ? (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-button border border-emerald-200 text-center flex flex-col gap-1">
                      <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-tight">
                        <CheckCircle2 size={16} /> Refunded Successfully
                      </div>
                      <span className="text-[9px] font-mono font-bold opacity-70">Ref: {selectedRequest.cancellation?.refundTxReference}</span>
                    </div>
                  ) : (
                    <div className="bg-rose-50 text-rose-700 p-3 rounded-button border border-rose-200 text-center flex flex-col gap-1">
                      <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-tight">
                        <XCircle size={16} /> Rejected
                      </div>
                      {selectedRequest.cancellation?.refundErrorReason && (
                        <p className="text-[10px] font-medium italic">Reason: {selectedRequest.cancellation.refundErrorReason}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
