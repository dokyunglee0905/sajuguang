import { useState } from 'react';
import type { BirthInfo } from '../types/saju';

const STORAGE_KEY = 'sajuguang_contacts';

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  birthInfo: BirthInfo;
  savedAt: number;
}

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveContacts(contacts: Contact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export function useContactsStore() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);

  const addContact = (name: string, relationship: string, birthInfo: BirthInfo) => {
    const newContact: Contact = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      relationship,
      birthInfo: { ...birthInfo, name },
      savedAt: Date.now(),
    };
    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveContacts(updated);
    return newContact;
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  return { contacts, addContact, removeContact };
}
