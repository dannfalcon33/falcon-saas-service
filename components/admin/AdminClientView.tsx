'use client';

import React, { useState } from 'react';
import { ClientTable } from './ClientTable';
import { ClientModal } from './ClientModal';
import { Plus, Search } from 'lucide-react';
import { Client } from '@/lib/types';

interface AdminClientViewProps {
  initialClients: any[];
}

export const AdminClientView = ({ initialClients }: AdminClientViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* We can add a specialized search or stats bar here if needed */}
        <div className="flex justify-end mb-4">
           {/* The search is actually inside the Table for now, but we can move it or duplicate */}
        </div>

        <ClientTable 
          initialClients={initialClients} 
          onEdit={handleEdit}
          onAdd={handleCreate}
        />
      </div>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
      />
    </>
  );
};
