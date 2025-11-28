import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { planSprintWithAI, generateJiraCSV } from '../services/geminiService';
import { Sprint, BacklogItem } from '../types';
import { Button, Input, Card, Badge, Modal } from '../components/ui';
import { Calendar, Play, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export const SprintPlanner: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState({
    velocity: 20,
    teamSize: 3,
    capacity: 20 // Often same as velocity, but editable
  });
  
  const [generatedSprint, setGeneratedSprint] = useState<Partial<Sprint> | null>(null);
  const [errorModal, setErrorModal] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ''});

  const handlePlan = async () => {
    setLoading(true);
    try {
      const backlog = await storageService.getBacklog();
      if (backlog.length === 0) {
        setErrorModal({
          isOpen: true,
          message: 'Backlog is empty! Please add items to your backlog before planning a sprint.'
        });
        setLoading(false);
        return;
      }

      const result = await planSprintWithAI(backlog, constraints);
      
      // Merge AI result with local backlog data to display nicely
      const hydratedAssignments = (result.assignments || []).map((assignment: any) => {
        const originalItem = backlog.find(b => b.title === assignment.backlog_item_title);
        return {
          ...assignment,
          backlog_item: originalItem,
          backlog_item_id: originalItem?.id
        };
      });

      setGeneratedSprint({
        sprint_name: result.sprint_name,
        ai_summary: result.ai_summary,
        assignments: hydratedAssignments,
        capacity: constraints.capacity,
        velocity: constraints.velocity
      });
      setStep(2);
    } catch (error) {
      console.error(error);
      setErrorModal({
        isOpen: true,
        message: 'Planning failed. Please check your API key.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!generatedSprint) return;
    try {
      const csv = await generateJiraCSV(generatedSprint.sprint_name || 'Sprint 1', generatedSprint.assignments || []);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sprint-export.csv`;
      a.click();
    } catch (e) {
      setErrorModal({
        isOpen: true,
        message: 'Export failed. Please try again.'
      });
    }
  };

  const closeErrorModal = () => setErrorModal({ ...errorModal, isOpen: false });

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan New Sprint</h1>
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8 p-4 bg-brand-50 text-brand-700 rounded-lg">
             <Calendar className="h-6 w-6" />
             <p className="text-sm">
               Define your sprint constraints. AI will select the best backlog items to fill your capacity while minimizing risk.
             </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <Input 
                 label="Target Velocity" 
                 type="number" 
                 value={constraints.velocity}
                 onChange={e => setConstraints({...constraints, velocity: parseInt(e.target.value)})}
               />
               <Input 
                 label="Sprint Capacity (Points)" 
                 type="number" 
                 value={constraints.capacity}
                 onChange={e => setConstraints({...constraints, capacity: parseInt(e.target.value)})}
               />
            </div>
            <Input 
               label="Team Size" 
               type="number" 
               value={constraints.teamSize}
               onChange={e => setConstraints({...constraints, teamSize: parseInt(e.target.value)})}
            />
            
            <Button size="lg" className="w-full mt-4" onClick={handlePlan} isLoading={loading}>
              <Play className="h-5 w-5 mr-2" />
              Generate Plan
            </Button>
          </div>
        </Card>

        <Modal isOpen={errorModal.isOpen} onClose={closeErrorModal} title="Attention">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-gray-600 mb-6">{errorModal.message}</p>
            <Button onClick={closeErrorModal} className="w-full">
                Okay
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{generatedSprint?.sprint_name}</h1>
          <p className="text-gray-500">AI Generated Plan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to Jira
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <span className="text-xl">🤖</span> AI Summary
        </h3>
        <p className="text-indigo-800 leading-relaxed">{generatedSprint?.ai_summary}</p>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="text-2xl font-bold text-gray-900">
            {generatedSprint?.assignments?.reduce((acc, curr) => acc + (curr.backlog_item?.story_points || 0), 0)}
            <span className="text-sm font-normal text-gray-400 ml-1">/ {constraints.capacity}</span>
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Items</p>
          <p className="text-2xl font-bold text-gray-900">{generatedSprint?.assignments?.length}</p>
        </Card>
        <Card className="p-4 text-center">
           <p className="text-sm text-gray-500">Risks Detected</p>
           <p className="text-2xl font-bold text-amber-600">
             {generatedSprint?.assignments?.filter((a: any) => a.risk_flag).length}
           </p>
        </Card>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk / Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {generatedSprint?.assignments?.sort((a,b) => a.order - b.order).map((assignment: any) => (
              <tr key={assignment.order}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{assignment.order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{assignment.backlog_item_title}</div>
                  <div className="text-xs text-gray-500">{assignment.backlog_item?.priority} Priority</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {assignment.backlog_item?.story_points}
                </td>
                <td className="px-6 py-4">
                  {assignment.risk_flag ? (
                    <span className="flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {assignment.risk_flag}
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Safe
                    </span>
                  )}
                  {assignment.notes && <p className="text-xs text-gray-500 mt-1">{assignment.notes}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={errorModal.isOpen} onClose={closeErrorModal} title="Notification">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-gray-600 mb-6">{errorModal.message}</p>
            <Button onClick={closeErrorModal} className="w-full">
                Okay
            </Button>
          </div>
      </Modal>
    </div>
  );
};