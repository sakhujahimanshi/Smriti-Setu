import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Eye,
  CheckCircle2,
  Trash2,
  MapPin,
  Calendar,
  Tag,
  Clock,
  HelpCircle,
  Play,
  Filter,
  RefreshCw,
  Compass
} from 'lucide-react';
import VRPreviewModal from './VRPreviewModal';
import AddMemoryModal from './AddMemoryModal';
import LiveSessionPanel from './LiveSessionPanel';

const CATEGORIES = ['All', 'Family', 'People', 'Places', 'Events', 'Childhood', 'Culture'];

export default function MemoryAlbum({
  memories = [],
  onRefresh,
  apiUrl,
  onStartVRSession,
  liveSessionData,
  onSkipMemory,
  onTogglePause,
  isPaused
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewMemory, setPreviewMemory] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filter memories by selected category
  const filteredMemories = useMemo(() => {
    if (selectedCategory === 'All') return memories;
    return memories.filter((m) => m.category === selectedCategory);
  }, [memories, selectedCategory]);

  const selectedCount = useMemo(() => {
    return memories.filter((m) => m.isSelectedForSession).length;
  }, [memories]);

  // Toggle selection for next VR session
  const handleToggleSelect = async (memoryId, e) => {
    e.stopPropagation();
    setActionLoadingId(memoryId);
    try {
      const res = await fetch(`${apiUrl}/api/memories/${memoryId}/toggle-select`, {
        method: 'PATCH'
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error toggling memory selection:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete memory
  const handleDelete = async (memoryId, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${title}" from the Memory Album?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/memories/${memoryId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  };

  // Select all or Deselect all
  const handleBatchSelect = async (selectAll) => {
    try {
      const res = await fetch(`${apiUrl}/api/memories/select-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectAll })
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (err) {
      console.error('Batch select error:', err);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Live Session Panel (Updates in real time via WebSockets) */}
      <LiveSessionPanel
        liveSessionData={liveSessionData}
        onSkipMemory={onSkipMemory}
        onTogglePause={onTogglePause}
        isPaused={isPaused}
      />

      {/* Album Header & Primary Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)'
            }}>
              <BookOpen size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '28px', color: '#FFFFFF', margin: 0, fontWeight: '700' }}>
                Memory Album & VR Studio
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Curate cherished personal keepsakes, test 4-second spatial VR previews, and launch voice-first VR sessions
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: '#334155',
              color: '#FFFFFF',
              border: '1px solid #475569',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            <span>+ Add Memory</span>
          </button>

          <button
            type="button"
            onClick={onStartVRSession}
            disabled={selectedCount === 0}
            style={{
              background: selectedCount > 0 ? 'linear-gradient(135deg, #10B981, #059669)' : '#475569',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 22px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: selectedCount > 0 ? '0 6px 20px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Play size={18} fill="#FFFFFF" />
            <span>Start Live VR Session ({selectedCount} Selected)</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills & Batch Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isActive ? '#4F46E5' : '#1E293B',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  border: isActive ? '1px solid #6366F1' : '1px solid #334155',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick Batch Selection Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94A3B8' }}>
          <span>Curate Playlist:</span>
          <button
            type="button"
            onClick={() => handleBatchSelect(true)}
            style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: '600', padding: 0 }}
          >
            Select All
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleBatchSelect(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: '600', padding: 0 }}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Memory Album Grid */}
      {filteredMemories.length === 0 ? (
        <div style={{
          background: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '24px',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '1rem' }}>No memories found in this category.</p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Add First Memory
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.75rem'
        }}>
          {filteredMemories.map((m) => {
            const isSelected = m.isSelectedForSession;
            const hasInsights = m.lastSessionInsights && m.lastSessionInsights.lastPlayedAt;

            return (
              <div
                key={m._id}
                style={{
                  background: '#1E293B',
                  border: isSelected ? '3px solid #10B981' : '1px solid #334155',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: isSelected
                    ? '0 10px 30px -5px rgba(16, 185, 129, 0.3)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* Photo Thumbnail with Aspect Ratio & Badges */}
                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#0F172A' }}>
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <span style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(6px)',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    {m.category}
                  </span>

                  {/* State / NER Pill */}
                  <span style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(3, 105, 161, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#BAE6FD',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    border: '1px solid #38BDF8'
                  }}>
                    📍 {m.state || 'Assam'}
                  </span>

                  {/* Status Indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '14px',
                      background: '#065F46',
                      color: '#A7F3D0',
                      border: '1px solid #10B981',
                      borderRadius: '14px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                    }}>
                      <CheckCircle2 size={14} color="#34D399" />
                      <span>✓ Selected for next session</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '20px', color: '#F8FAFC', marginBottom: '8px', fontWeight: '700', lineHeight: '1.3' }}>
                    {m.title}
                  </h3>

                  {/* Metadata Row: Relationship & Setting */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#94A3B8', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {m.relationship && (
                      <span style={{ color: '#FCD34D', fontWeight: '600' }}>
                        👤 {m.relationship}
                      </span>
                    )}
                    {m.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />
                        {m.location}
                      </span>
                    )}
                    {m.datePeriod && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {m.datePeriod}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: '#CBD5E1',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    flex: 1
                  }}>
                    {m.details || m.questionPrompt}
                  </p>

                  {/* Post-Session Longitudinal Insights Display */}
                  {hasInsights ? (
                    <div style={{
                      background: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      marginBottom: '1.25rem',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#94A3B8' }}>Last VR Session:</strong>
                        <span style={{
                          color: m.lastSessionInsights.recallStatus === 'Successful' ? '#34D399' : '#FCD34D',
                          fontWeight: '700'
                        }}>
                          {m.lastSessionInsights.recallStatus === 'Successful' ? 'Recall: Successful' : 'Needed gentle assistance'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#94A3B8', fontSize: '12px' }}>
                        <span>Attempts: <strong style={{ color: '#E2E8F0' }}>{m.lastSessionInsights.attempts || 1}</strong></span>
                        <span>Hint: <strong style={{ color: '#E2E8F0' }}>{m.lastSessionInsights.hintsDelivered > 0 ? 'Yes' : 'No'}</strong></span>
                        <span>Response time: <strong style={{ color: '#E2E8F0' }}>{m.lastSessionInsights.responseTimeSeconds || 5.2}s</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      border: '1px dashed #334155',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      marginBottom: '1.25rem',
                      fontSize: '12px',
                      color: '#64748B'
                    }}>
                      Status: Ready for first VR session
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    paddingTop: '1rem',
                    borderTop: '1px solid #334155'
                  }}>
                    {/* Action Button 1: Preview in VR */}
                    <button
                      type="button"
                      onClick={() => setPreviewMemory(m)}
                      style={{
                        background: 'rgba(79, 70, 229, 0.15)',
                        color: '#A5B4FC',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Eye size={15} />
                      <span>Preview in VR</span>
                    </button>

                    {/* Action Button 2: Select for Session */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelect(m._id, e)}
                      disabled={actionLoadingId === m._id}
                      style={{
                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#334155',
                        color: isSelected ? '#6EE7B7' : '#FFFFFF',
                        border: isSelected ? '1px solid #10B981' : '1px solid #475569',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>{isSelected ? '✓ In Session' : 'Select'}</span>
                    </button>
                  </div>

                  {/* Bottom Delete link */}
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(m._id, m.title, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                      title="Delete Memory"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4-Second VR Preview Modal (Hero Feature) */}
      <VRPreviewModal
        isOpen={!!previewMemory}
        memory={previewMemory}
        onClose={() => setPreviewMemory(null)}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemoryAdded={() => {
          if (onRefresh) onRefresh();
        }}
        apiUrl={apiUrl}
      />
    </div>
  );
}
