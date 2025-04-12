// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Table from "../components/Table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Home.css";

export default function Home() {
  const [attendance, setAttendance] = useState([]);
  const [pendingUID, setPendingUID] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchAttendance = async () => {
    const res = await axios.get("http://localhost:3000/api/attendance");
    setAttendance(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:3000/api/users");
    setUsers(res.data);
  };

  const checkPendingUID = async () => {
    const res = await axios.get("http://localhost:3000/api/users/pending").catch(() => null);
    if (res?.data?.uid) {
      setPendingUID(res.data.uid);
    }
  };

  const addUser = async () => {
    if (!newUserName || !pendingUID) return;
    setLoading(true);
    await axios.post("http://localhost:3000/api/users", { name: newUserName, uid: pendingUID });
    setNewUserName("");
    setPendingUID(null);
    setLoading(false);
    await Promise.all([fetchAttendance(), fetchUsers()]);
  };

  const deleteUser = async (uid) => {
    await axios.delete(`http://localhost:3000/api/users/${uid}`);
    await Promise.all([fetchUsers(), fetchAttendance()]);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Attendance Report", 14, 16);

    autoTable(doc, {
      startY: 24,
      head: [["Name", "Check In", "Check Out"]],
      body: attendance.map((entry) => [
        entry.name,
        formatDate(entry.check_in),
        entry.check_out ? formatDate(entry.check_out) : "—",
      ]),
    });

    doc.save("attendance-report.pdf");
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
    const interval = setInterval(() => {
      checkPendingUID();
      fetchAttendance();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container fade-in">
      <h1 className="title gradient-text">CheckPoint — Smart Attendance System</h1>
      <p className="subtitle">Track and manage employee check-ins & check-outs in real time using RFID.</p>

      <div className="card slide-up">
        <h2>Add New User</h2>
        {pendingUID ? (
          <div className="form-row">
            <Input
              placeholder="Enter name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <Button onClick={addUser} disabled={loading || !newUserName}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="card-info">Detected Card: {pendingUID}</p>
          </div>
        ) : (
          <p className="card-info">Waiting for new card scan...</p>
        )}
      </div>

      <div className="card slide-up">
        <h2>Registered Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span>{user.name} — <small style={{ color: '#666' }}>{user.uid}</small></span>
              <Button onClick={() => deleteUser(user.uid)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card slide-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Attendance Log</h2>
          <Button onClick={exportToPDF}>Export PDF</Button>
        </div>
        <Table data={attendance} />
      </div>
    </div>
  );
}