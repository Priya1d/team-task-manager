import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const isAdmin = project?.admin._id === user?.id || 
                  project?.members.some(m => m.user._id === user?.id && m.role === 'admin');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.getOne(id),
        taskAPI.getByProject(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading project');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskAPI.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      alert('Error deleting task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await taskAPI.update(taskId, updates);
      setTasks(tasks.map(t => t._id === taskId ? response.data : t));
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    
    try {
      await projectAPI.removeMember(id, userId);
      fetchProjectAndTasks();
    } catch (error) {
      alert('Error removing member');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Projects
          </Link>
          <Link
            to={`/dashboard/${id}`}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            View Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="flex flex-wrap gap-4">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Create Task
                </button>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Member
                </button>
              </>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Team Members ({project.members.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                  {isAdmin && member.user._id !== project.admin._id && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-4 py-2 rounded ${filter === 'todo' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              To Do ({tasks.filter(t => t.status === 'todo').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              In Progress ({tasks.filter(t => t.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-4 py-2 rounded ${filter === 'done' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Done ({tasks.filter(t => t.status === 'done').length})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                isAdmin={isAdmin}
                currentUserId={user.id}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <CreateTaskModal
          projectId={id}
          members={project.members}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            fetchProjectAndTasks();
          }}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowMemberModal(false)}
          onSuccess={() => {
            setShowMemberModal(false);
            fetchProjectAndTasks();
          }}
        />
      )}
    </div>
  );
}