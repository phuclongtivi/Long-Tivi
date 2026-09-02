'use client';

/**
 * Username theo hạng:
 * - admin: đỏ, đậm
 * - nghệ sĩ: gradient nhiều màu, đậm
 * - phóng viên: xanh ngọc lục bảo, chữ thường
 */

import { normalizeRank } from '@/lib/rank';

type Props = {
  name?: string | null;
  rank?: string | null;
  role?: string | null;
  className?: string;
  as?: 'span' | 'p' | 'div';
};

export default function RankedUsername({
  name,
  rank,
  role,
  className = '',
  as: Tag = 'span',
}: Props) {
  const label = name || 'User';
  const r = normalizeRank(rank || 'user');
  const isAdmin = role === 'admin' || role === 'boss' || rank === 'admin';

  if (isAdmin) {
    return (
      <Tag className={`font-bold ${className}`} style={{ color: '#C41E3A' }} title="Admin">
        {label}
      </Tag>
    );
  }

  if (r === 'artist') {
    return (
      <Tag
        className={`font-bold ${className}`}
        style={{
          backgroundImage:
            'linear-gradient(90deg, #C41E3A, #E67E22, #F1C40F, #2ECC71, #3498DB, #9B59B6)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
        title="Nghệ sĩ"
      >
        {label}
      </Tag>
    );
  }

  if (r === 'reporter') {
    return (
      <Tag
        className={`font-normal ${className}`}
        style={{ color: '#046307' }}
        title="Phóng viên"
      >
        {label}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={{ color: '#1A1A1A' }}>
      {label}
    </Tag>
  );
}
