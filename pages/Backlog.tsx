import React, { useEffect, useState } from 'react';
import { BacklogItem, Priority } from '../types';
import { storageService } from '../services/storageService';
import { parseBacklogWithAI } from '../services/geminiService';
import { Button, Input, Select, Card, Badge, Modal } from '../components/ui';
import { Plus, Wand2, Trash2, Edit2, AlertCircle } from 'lucide-react';

export const Backlog: React.FC = () => {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // New Item State
  const [newItem, setNewItem] = useState<{title: string, story_points: number, priority: Priority}>({
    title: '', story_points: 1, priority: 'Medium'
  });

  useEffect(() => {
    loadBacklog();
  }, []);

  const loadBacklog = async () => {
    setLoading(true);
    const data = await storageService.getBacklog();
    setItems(data);
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.addBacklogItem({ ...newItem, description: '', dependencies: [] });
    setIsModalOpen(false);
    loadBacklog();
  };

  const handleDelete = async (id: string) => {
    await storageService.deleteBacklogItem(id);
    loadBacklog();
  };

  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    setAiLoading(true);
    try {
      const parsedItems = await parseBacklogWithAI(rawText);
      for (const item of parsedItems) {
        await storageService.addBacklogItem(item as any);
      }
      setRawText('');
      setIsAiModalOpen(false);
      loadBacklog();
    } catch (e) {
      console.error(e);
      alert('AI Parsing failed. Check API Key.');
    } finally {
      setAiLoading(false);
    }
  };

  const priorityColors = {
    Low: 'neutral',
    Medium: 'warning',
    High: 'danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Backlog</h1>
          <p className="text-gray-500">Manage and prioritize your user stories.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAiModalOpen(true)}>
            <Wand2 className="h-4 w-4 mr-2" />
            AI Import
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No items yet</h3>
            <p className="text-gray-500 mt-1">Get started by adding an item or using AI import.</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                  {item.story_points}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={priorityColors[item.priority] as any}>{item.priority}</Badge>
                    {item.dependencies?.length > 0 && <span className="text-xs text-gray-400">Has dependencies</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* New Item Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Backlog Item">
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input 
            label="Title" 
            required 
            value={newItem.title} 
            onChange={e => setNewItem({...newItem, title: e.target.value})} 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Points" 
              type="number" 
              required 
              value={newItem.story_points} 
              onChange={e => setNewItem({...newItem, story_points: parseInt(e.target.value)})} 
            />
            <Select 
              label="Priority"
              value={newItem.priority}
              onChange={e => setNewItem({...newItem, priority: e.target.value as Priority})}
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Medium', value: 'Medium' },
                { label: 'High', value: 'High' }
              ]}
            />
          </div>
          <Button type="submit" className="w-full">Create Item</Button>
        </form>
      </Modal>

      {/* AI Import Modal */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="AI Bulk Import">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Paste raw text (emails, meeting notes, slack messages) below. AI will parse it into tickets.
          </p>
          <textarea
            className="w-full h-32 p-3 border rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
            placeholder="Example: We need a login page (High priority). Also a dashboard for users (5 points)."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
          <Button onClick={handleAiParse} isLoading={aiLoading} className="w-full">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Tickets
          </Button>
        </div>
      </Modal>
    </div>
  );
};