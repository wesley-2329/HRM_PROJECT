import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../api';
import { AuthContext } from './AuthContext';
import { useToast } from '../components/Toast';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [warningLetters, setWarningLetters] = useState([]);



  const fetchEmployees = async () => {
    try {
      if (user?.role === 'hr') {
        const res = await api.get('/employees');
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      if (user?.role === 'hr') {
        const res = await api.get('/candidates');
        setCandidates(res.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await api.get('/trainings');
      setTrainings(res.data);
    } catch (err) {
      console.error('Error fetching trainings:', err);
    }
  };

  const fetchTimesheets = async () => {
    try {
      const res = await api.get('/timesheet');
      setTimesheets(res.data);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const res = await api.get('/chat');
      setChatMessages(res.data);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchDiscussionMessages = async () => {
    try {
      const res = await api.get('/discussion');
      setDiscussionMessages(res.data);
    } catch (err) {
      console.error('Error fetching discussion messages:', err);
    }
  };

  const fetchWarningLetters = async () => {
    try {
      const res = await api.get('/warning-letters');
      setWarningLetters(res.data);
    } catch (err) {
      console.error('Error fetching warning letters:', err);
    }
  };

  const fetchAllData = async () => {
    if (!user) return;
    await Promise.all([
      fetchLeaves(),
      fetchTasks(),
      fetchTickets(),
      fetchMeetings(),
      fetchTrainings(),
      fetchTimesheets(),
      fetchNotifications(),
      fetchDiscussionMessages(),
      fetchWarningLetters(),
      user.role === 'hr' ? fetchEmployees() : Promise.resolve(),
      user.role === 'hr' ? fetchCandidates() : Promise.resolve(),
      user.role !== 'hr' ? fetchChatMessages() : Promise.resolve()
    ]);
  };
  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!user) return;

    const socket = io('/', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      socket.emit('join', { userId: user.id, role: user.role });
    });

    socket.on('notification', (notif) => {
      console.log('Notification socket message received:', notif);
      showToast(`${notif.title}: ${notif.desc}`, 'info');
      fetchNotifications();
      if (notif.type === 'leave') {
        fetchLeaves();
      } else if (notif.type === 'meeting') {
        fetchMeetings();
      } else if (notif.type === 'reminder') {
        fetchTasks();
        fetchTickets();
        fetchWarningLetters();
      }
    });

    socket.on('discussion_message', (msg) => {
      setDiscussionMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        employees,
        leaves,
        tasks,
        tickets,
        candidates,
        meetings,
        trainings,
        timesheets,
        chatMessages,
        notifications,
        discussionMessages,
        warningLetters,
        setEmployees,
        setLeaves,
        setTasks,
        setTickets,
        setCandidates,
        setMeetings,
        setTrainings,
        setTimesheets,
        setChatMessages,
        setNotifications,
        setDiscussionMessages,
        setWarningLetters,
        fetchEmployees,
        fetchLeaves,
        fetchTasks,
        fetchTickets,
        fetchCandidates,
        fetchMeetings,
        fetchTrainings,
        fetchTimesheets,
        fetchChatMessages,
        fetchNotifications,
        fetchDiscussionMessages,
        fetchWarningLetters,
        fetchAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
