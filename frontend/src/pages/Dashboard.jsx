import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dashboardAPI, projectAPI } from '../services/api';

export default function Dashboard() {
  const { id } = useParams();
  const [stats, setStats] = useState({
  totalTasks: 0,
  overdueTasks: 0,
  tasksByStatus: {
    todo: 0,
    inProgress: 0,
    done: 0
  },
  tasksByPriority: [],
  tasksPerUser: []
});
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const fetchDashboard = async () => {
    try {
      const [statsRes, projectRes] = await Promise.all([
        dashboardAPI.getStats(id),
        projectAPI.getOne(id)
      ]);
      setStats(statsRes.data);
      setProject(projectRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const completionRate = stats.totalTasks > 0 
    ? ((stats.tasksByStatus.done / stats.totalTasks) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to={`/projects/${id}`} className="text-blue-600 hover:text-blue-700">
            ← Back to Project
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{project?.name} - Dashboard</h1>
        <p className="text-gray-600 mb-8">Project analytics and statistics</p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon="📋"
            color="bg-blue-500"
          />
          <StatCard
            title="To Do"
            value={stats.tasksByStatus.todo}
            icon="⏳"
            color="bg-gray-500"
          />
          <StatCard
            title="In Progress"
            value={stats.tasksByStatus.inProgress}
            icon="🔄"
            color="bg-yellow-500"
          />
          <StatCard
            title="Completed"
            value={stats.tasksByStatus.done}
            icon="✅"
            color="bg-green-500"
          />
        </div>

        {/* Progress and Overdue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Completion Rate</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-blue-600">{completionRate}%</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    {stats.tasksByStatus.done} of {stats.totalTasks} tasks
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Overdue Tasks</h3>
            <div className="flex items-center">
              <span className="text-5xl mr-4">⚠️</span>
              <div>
                <p className="text-4xl font-bold text-red-600">{stats.overdueTasks}</p>
                <p className="text-gray-600">
                  {stats.overdueTasks === 0 ? 'All on track!' : 'Need attention'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Tasks by Priority</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.tasksByPriority.map((item) => (
              <div key={item._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item._id === 'high' ? 'bg-red-100 text-red-800' :
                    item._id === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item._id?.toUpperCase() || 'NONE'}
                  </span>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks per User */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Tasks per Team Member</h3>
          {stats.tasksPerUser.length === 0 ? (
            <p className="text-gray-500">No tasks assigned yet</p>
          ) : (
            <div className="space-y-3">
              {stats.tasksPerUser.map((user) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{user.count}</span>
                    <span className="text-gray-600">tasks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
} 