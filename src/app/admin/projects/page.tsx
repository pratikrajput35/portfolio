'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiPlus, FiTrash2, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDraggedItem(index);
  
  const handleDragEnter = (index: number) => setDragOverItem(index);

  const handleDragEnd = async () => {
    if (draggedItem === null || dragOverItem === null || draggedItem === dragOverItem) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newProjects = [...projects];
    const draggedProject = newProjects[draggedItem];
    newProjects.splice(draggedItem, 1);
    newProjects.splice(dragOverItem, 0, draggedProject);

    const updatedProjects = newProjects.map((p, idx) => ({ ...p, order: idx }));
    setProjects(updatedProjects);
    setDraggedItem(null);
    setDragOverItem(null);

    const toastId = toast.loading('Saving new order...');
    try {
      await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updatedProjects.map(p => ({ id: p._id, order: p.order })) })
      });
      toast.success('Project order saved!', { id: toastId });
    } catch {
      toast.error('Failed to save order', { id: toastId });
    }
  };

  const fetchProjects = () => {
    setLoading(true);
    // Fetch all projects including unpublished for admin
    Promise.all([
      fetch('/api/projects?all=true').then(r => r.json()),
    ]).then(([p]) => {
      setProjects(Array.isArray(p) ? p : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Project deleted'); fetchProjects(); }
    else toast.error('Error deleting');
  };

  const togglePublish = async (project: any) => {
    await fetch(`/api/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !project.isPublished }),
    });
    toast.success(project.isPublished ? 'Project hidden' : 'Project published');
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">{projects.length} total projects</p>
        </div>
        <Link href="/admin/projects/new" className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90">
          <FiPlus /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎨</div>
          <p className="text-gray-400 mb-4">No projects yet</p>
          <Link href="/admin/projects/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold">
            <FiPlus /> Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
          {projects.map((project, i) => (
            <motion.div 
              key={project._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              className={`cursor-grab active:cursor-grabbing transition-all ${draggedItem === i ? 'opacity-40 scale-95' : 'opacity-100'}`}
            >
              <div className={`bg-[#111] border rounded-2xl overflow-hidden transition-all h-full flex flex-col ${project.isPublished ? 'border-gray-800 hover:border-orange-500/50' : 'border-orange-500/20 opacity-70'}`}>
                <div className="relative">
                  {project.coverImage ? (
                    <Image src={project.coverImage} alt={project.title} width={300} height={200} className="w-full h-auto object-cover" />
                  ) : (
                    <div className="w-full aspect-video gradient-bg opacity-20 flex items-center justify-center text-3xl">🎨</div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.isPublished ? 'bg-green-500/80 text-white backdrop-blur-sm' : 'bg-orange-500/80 text-white backdrop-blur-sm'}`}>
                      {project.isPublished ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-white text-sm truncate">{project.title}</div>
                  {project.category?.name && (
                    <div className="text-orange-400 text-xs mt-0.5">{project.category.name}</div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/projects/${project._id}/edit`} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-gray-300 text-xs font-medium transition-all">
                      <FiEdit size={13} /> Edit
                    </Link>
                    <button onClick={() => togglePublish(project)} className="p-2 rounded-lg bg-gray-800 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 transition-all">
                      {project.isPublished ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
