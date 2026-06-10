import React, { createContext, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

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
      user.role === 'hr' ? fetchEmployees() : Promise.resolve(),
      user.role === 'hr' ? fetchCandidates() : Promise.resolve(),
      user.role !== 'hr' ? fetchChatMessages() : Promise.resolve()
    ]);
  };

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
        fetchAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
