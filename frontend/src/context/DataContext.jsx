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
  const [departments, setDepartments] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [orgAuditLogs, setOrgAuditLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [gradeBands, setGradeBands] = useState([]);
  const [reportingHistory, setReportingHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [designationHistory, setDesignationHistory] = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [successionPlans, setSuccessionPlans] = useState([]);
  const [headcountPlans, setHeadcountPlans] = useState([]);



  const fetchEmployees = async () => {
    try {
      if (user?.role === 'hr') {
        const res = await api.get('/employees');
        setEmployees(res.data);
      } else if (user) {
        const res = await api.get('/employees/public');
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

  const fetchDepartments = async () => {
    try {
      if (user) {
        const res = await api.get('/org/departments');
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchVacancies = async () => {
    try {
      if (user) {
        const res = await api.get('/org/vacancies');
        setVacancies(res.data);
      }
    } catch (err) {
      console.error('Error fetching vacancies:', err);
    }
  };

  const fetchVaultDocuments = async () => {
    try {
      if (user) {
        const res = await api.get('/vault/documents');
        setVaultDocuments(res.data);
      }
    } catch (err) {
      console.error('Error fetching vault documents:', err);
    }
  };

  const fetchOrgAuditLogs = async () => {
    try {
      if (user && user.role === 'hr') {
        const res = await api.get('/org/audit-logs');
        setOrgAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching org audit logs:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      if (user) {
        const res = await api.get('/org/companies');
        setCompanies(res.data);
      }
    } catch (err) { console.error('Error fetching companies:', err); }
  };

  const fetchBranches = async () => {
    try {
      if (user) {
        const res = await api.get('/org/branches');
        setBranches(res.data);
      }
    } catch (err) { console.error('Error fetching branches:', err); }
  };

  const fetchBusinessUnits = async () => {
    try {
      if (user) {
        const res = await api.get('/org/business-units');
        setBusinessUnits(res.data);
      }
    } catch (err) { console.error('Error fetching business units:', err); }
  };

  const fetchCostCenters = async () => {
    try {
      if (user) {
        const res = await api.get('/org/cost-centers');
        setCostCenters(res.data);
      }
    } catch (err) { console.error('Error fetching cost centers:', err); }
  };

  const fetchSubDepartments = async () => {
    try {
      if (user) {
        const res = await api.get('/org/sub-departments');
        setSubDepartments(res.data);
      }
    } catch (err) { console.error('Error fetching sub departments:', err); }
  };

  const fetchDesignations = async () => {
    try {
      if (user) {
        const res = await api.get('/org/designations');
        setDesignations(res.data);
      }
    } catch (err) { console.error('Error fetching designations:', err); }
  };

  const fetchGradeBands = async () => {
    try {
      if (user) {
        const res = await api.get('/org/grade-bands');
        setGradeBands(res.data);
      }
    } catch (err) { console.error('Error fetching grade bands:', err); }
  };

  const fetchReportingHistory = async () => {
    try {
      if (user) {
        const res = await api.get('/org/reporting-history');
        setReportingHistory(res.data);
      }
    } catch (err) { console.error('Error fetching reporting history:', err); }
  };

  const fetchTransferHistory = async () => {
    try {
      if (user) {
        const res = await api.get('/org/transfer-history');
        setTransferHistory(res.data);
      }
    } catch (err) { console.error('Error fetching transfer history:', err); }
  };

  const fetchDesignationHistory = async () => {
    try {
      if (user) {
        const res = await api.get('/org/designation-history');
        setDesignationHistory(res.data);
      }
    } catch (err) { console.error('Error fetching designation history:', err); }
  };

  const fetchLegalEntities = async () => {
    try {
      if (user) {
        const res = await api.get('/org/legal-entities');
        setLegalEntities(res.data);
      }
    } catch (err) { console.error('Error fetching legal entities:', err); }
  };

  const fetchRegions = async () => {
    try {
      if (user) {
        const res = await api.get('/org/regions');
        setRegions(res.data);
      }
    } catch (err) { console.error('Error fetching regions:', err); }
  };

  const fetchBuildings = async () => {
    try {
      if (user) {
        const res = await api.get('/org/buildings');
        setBuildings(res.data);
      }
    } catch (err) { console.error('Error fetching buildings:', err); }
  };

  const fetchFloors = async () => {
    try {
      if (user) {
        const res = await api.get('/org/floors');
        setFloors(res.data);
      }
    } catch (err) { console.error('Error fetching floors:', err); }
  };

  const fetchTeams = async () => {
    try {
      if (user) {
        const res = await api.get('/org/teams');
        setTeams(res.data);
      }
    } catch (err) { console.error('Error fetching teams:', err); }
  };

  const fetchPositions = async () => {
    try {
      if (user) {
        const res = await api.get('/org/positions');
        setPositions(res.data);
      }
    } catch (err) { console.error('Error fetching positions:', err); }
  };

  const fetchPolicies = async () => {
    try {
      if (user) {
        const res = await api.get('/org/policies');
        setPolicies(res.data);
      }
    } catch (err) { console.error('Error fetching policies:', err); }
  };

  const fetchDocuments = async () => {
    try {
      if (user) {
        const res = await api.get('/org/documents');
        setDocuments(res.data);
      }
    } catch (err) { console.error('Error fetching documents:', err); }
  };

  const fetchSuccessionPlans = async () => {
    try {
      if (user) {
        const res = await api.get('/org/succession-plans');
        setSuccessionPlans(res.data);
      }
    } catch (err) { console.error('Error fetching succession plans:', err); }
  };

  const fetchHeadcountPlans = async () => {
    try {
      if (user) {
        const res = await api.get('/org/headcount-plans');
        setHeadcountPlans(res.data);
      }
    } catch (err) { console.error('Error fetching headcount plans:', err); }
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
      fetchDepartments(),
      fetchVacancies(),
      fetchVaultDocuments(),
      fetchCompanies(),
      fetchBranches(),
      fetchBusinessUnits(),
      fetchCostCenters(),
      fetchSubDepartments(),
      fetchDesignations(),
      fetchGradeBands(),
      fetchReportingHistory(),
      fetchTransferHistory(),
      fetchDesignationHistory(),
      fetchLegalEntities(),
      fetchRegions(),
      fetchBuildings(),
      fetchFloors(),
      fetchTeams(),
      fetchPositions(),
      fetchPolicies(),
      fetchDocuments(),
      fetchSuccessionPlans(),
      fetchHeadcountPlans(),
      user.role === 'hr' ? fetchEmployees() : Promise.resolve(),
      user.role === 'hr' ? fetchCandidates() : Promise.resolve(),
      user.role === 'hr' ? fetchOrgAuditLogs() : Promise.resolve(),
      user.role !== 'hr' ? fetchChatMessages() : Promise.resolve()
    ]);
  };
  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
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
        fetchVaultDocuments();
        fetchOrgAuditLogs();
        fetchDepartments();
        fetchVacancies();
      }
    });

    socket.on('discussion_message', (msg) => {
      setDiscussionMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('org_update', (data) => {
      console.log('Real-time Org Update socket trigger received:', data);
      showToast(`Structure Update: ${data.details}`, 'info');
      fetchAllData();
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
        departments,
        vacancies,
        vaultDocuments,
        orgAuditLogs,
        companies,
        branches,
        businessUnits,
        costCenters,
        subDepartments,
        designations,
        gradeBands,
        reportingHistory,
        transferHistory,
        designationHistory,
        legalEntities,
        regions,
        buildings,
        floors,
        teams,
        positions,
        policies,
        documents,
        successionPlans,
        headcountPlans,
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
        setDepartments,
        setVacancies,
        setVaultDocuments,
        setOrgAuditLogs,
        setCompanies,
        setBranches,
        setBusinessUnits,
        setCostCenters,
        setSubDepartments,
        setDesignations,
        setGradeBands,
        setReportingHistory,
        setTransferHistory,
        setDesignationHistory,
        setLegalEntities,
        setRegions,
        setBuildings,
        setFloors,
        setTeams,
        setPositions,
        setPolicies,
        setDocuments,
        setSuccessionPlans,
        setHeadcountPlans,
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
        fetchDepartments,
        fetchVacancies,
        fetchVaultDocuments,
        fetchOrgAuditLogs,
        fetchCompanies,
        fetchBranches,
        fetchBusinessUnits,
        fetchCostCenters,
        fetchSubDepartments,
        fetchDesignations,
        fetchGradeBands,
        fetchReportingHistory,
        fetchTransferHistory,
        fetchDesignationHistory,
        fetchLegalEntities,
        fetchRegions,
        fetchBuildings,
        fetchFloors,
        fetchTeams,
        fetchPositions,
        fetchPolicies,
        fetchDocuments,
        fetchSuccessionPlans,
        fetchHeadcountPlans,
        fetchAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
