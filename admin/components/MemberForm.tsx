"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  member?: { id: string; full_name: string; email: string };
  onSaved?: () => void;
}

export default function MemberForm({ member, onSaved }: Props) {
  const [fullName, setFullName] = useState(member?.full_name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (member) {
      await supabase.from('members').update({ full_name: fullName, email }).eq('id', member.id);
    } else {
      await supabase.from('members').insert({ full_name: fullName, email });
    }
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="fullName">Name</label>
      <input id="fullName" aria-label="Name" value={fullName} onChange={e => setFullName(e.target.value)} />
      <label htmlFor="email">Email</label>
      <input id="email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
