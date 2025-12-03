import React, { useEffect, useState } from 'react';
import { Record } from '../types';
import { getRecords, createRecord, updateRecord, deleteRecord, subscribe } from '../services/db';
import { Plus, Search, Edit2, Trash2, X, Save, Calendar, Filter, Download } from 'lucide-react';

export const Records: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchRecords();
    
    // Subscribe to DB changes (e.g., from CLI)
    const unsubscribe = subscribe(() => {
        fetchRecords();
    });

    return () => unsubscribe();
  }, []);

  const fetchRecords = async () => {
    // Keep loading true only on first load to avoid flickering updates
    if (records.length === 0) setLoading(true);
    const data = await getRecords();
    setRecords(data);
    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const filteredRecords = records.filter(r => {
    // Text Search
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date Filtering
    let matchesDate = true;
    const recordDate = new Date(r.createdAt);

    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      // Create local date object at 00:00:00
      const startLocal = new Date(y, m - 1, d); 
      if (recordDate < startLocal) matchesDate = false;
    }

    if (endDate) {
      const [y, m, d] = endDate.split('-').map(Number);
      // Create local date object at 23:59:59.999
      const endLocal = new Date(y, m - 1, d, 23, 59, 59, 999);
      if (recordDate > endLocal) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export matching current filters.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Address", "Created At"];
    const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
    
    const rows = filteredRecords.map(r => [
        escapeCsv(r.id),
        escapeCsv(r.name),
        escapeCsv(r.email),
        escapeCsv(r.phone),
        escapeCsv(r.address),
        escapeCsv(new Date(r.createdAt).toLocaleString())
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `iffidb_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      await updateRecord(editingRecord.id, formData);
    } else {
      await createRecord(formData);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    // fetchRecords is handled by subscription now, but we can call it to be safe or leave it
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  const openEditModal = (record: Record) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      email: record.email,
      phone: record.phone,
      address: record.address,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Records Management</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Download size={20} />
              Export Records
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/30"
            >
              <Plus size={20} />
              Add New Record
            </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Calendar size={18} />
               </div>
               <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm text-gray-700 dark:text-gray-200"
                  aria-label="Start Date"
               />
            </div>
            
            <div className="hidden sm:flex items-center text-gray-400 font-medium">-</div>
            
            <div className="relative">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Calendar size={18} />
               </div>
               <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm text-gray-700 dark:text-gray-200"
                  aria-label="End Date"
               />
            </div>

            {/* Clear Button */}
            {(searchTerm || startDate || endDate) && (
              <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center justify-center gap-2"
                  title="Clear Filters"
              >
                  <X size={20} />
                  <span className="sm:hidden">Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Contact Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Address</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Joined</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Filter size={40} className="text-gray-300 mb-3" />
                      <p>No records found matching your filters.</p>
                      {(searchTerm || startDate || endDate) && (
                        <button onClick={clearFilters} className="mt-2 text-primary hover:underline text-sm">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{record.name}</div>
                      <div className="text-xs text-gray-400">ID: {record.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{record.email}</div>
                      <div className="text-sm text-gray-500">{record.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                      {record.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(record)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingRecord ? 'Edit Record' : 'Add New Record'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-primary/30 transition-all"
                >
                  <Save size={18} />
                  {editingRecord ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};