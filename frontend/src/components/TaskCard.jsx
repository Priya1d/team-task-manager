export default function TaskCard({ task, isAdmin, currentUserId, onUpdate, onDelete }) {
  const isAssigned = task.assignedTo?._id === currentUserId;
  const canEdit = isAdmin || isAssigned;

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{task.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
            {isOverdue && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                OVERDUE
              </span>
            )}
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            {task.assignedTo && (
              <p>👤 Assigned to: <span className="font-medium">{task.assignedTo.name}</span></p>
            )}
            {task.dueDate && (
              <p>📅 Due: <span className="font-medium">
                {new Date(task.dueDate).toLocaleDateString()}
              </span></p>
            )}
            <p>👨‍💼 Created by: {task.createdBy?.name || 'Unknown'}</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete(task._id)}
            className="ml-4 text-red-500 hover:text-red-700"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {canEdit && (
        <div className="mt-4 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Update Status:</label>
          <select
            value={task.status}
            onChange={(e) => onUpdate(task._id, { status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}
    </div>
  );
} 