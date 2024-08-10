import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import axios from 'axios';
import BarChart from "../../components/BarChart"; // Ensure this import is correct

const Team = ({ setEmployeeCount }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get('https://hr-backend-gamma.vercel.app/api/getUser');
        const data = response.data;
        setTeamData(data);
        setEmployeeCount(data.length); // Update employee count
    
        // Calculate the role counts
        const roleCounts = data.reduce((acc, user) => {
          acc[user.status] = (acc[user.status] || 0) + 1;
          return acc;
        }, {});
    
        // Convert roleCounts to array format suitable for BarChart
        const roleArray = [
          { department: 'Admin', totalSalary: roleCounts.Admin || 0 },
          { department: 'Manager', totalSalary: roleCounts.Manager || 0 },
          { department: 'Employee', totalSalary: roleCounts.Employee || 0 }
        ];
    
        setRoleData(roleArray);
      } catch (error) {
        console.error('Error fetching team data', error);
      }
    };
    

    fetchTeamData();
  }, [setEmployeeCount]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setPopupOpen(true);
  };

  const handleDeleteClick = async () => {
    if (selectedUser == null) {
      alert("Please select a user first!");
    } else {
      try {
        const response = await axios.delete(`https://hr-backend-gamma.vercel.app/api/deleteUser/${selectedUser._id}`);
        if (response.status === 200) {
          setTeamData(teamData.filter((item) => item._id !== selectedUser._id));
          setSelectedUser(null);
        } else {
          console.error('Error deleting user:', response.data);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://hr-backend-gamma.vercel.app/api/updateUser/${selectedUser._id}`, {
        name: e.target.name.value,
        designation: e.target.designation.value,
        status: e.target.status.value,
        personalEmail: e.target.personalEmail.value,
        reportTo: e.target.reportTo.value,
      });
      const updatedData = await axios.get('https://hr-backend-gamma.vercel.app/api/getUser');
      setTeamData(updatedData.data);
      setEmployeeCount(updatedData.data.length); // Update employee count
      setPopupOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-column--cell" },
    { field: "designation", headerName: "Designation", flex: 1 },
    {
      field: "status",
      headerName: "Access Level",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap="10px">
          {params.value === "Admin" && <AdminPanelSettingsOutlinedIcon />}
          {params.value === "Manager" && <SecurityOutlinedIcon />}
          {params.value === "Employee" && <LockOpenOutlinedIcon />}
          <Typography>{params.value}</Typography>
        </Box>
      )
    },
    { field: "personalEmail", headerName: "Email", flex: 1 },
    { field: "reportTo", headerName: "Managed By", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={teamData}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={(ids) => { 
            const selectedID = ids[0];
            const user = teamData.find((item) => item._id === selectedID);
            setSelectedUser(user);
          }}
          disableMultipleRowSelection={true}
        />
      </Box>

      <Box m="40px 0 0 0">
        <Typography variant="h5" fontWeight="600">
          Role Distribution
        </Typography>
        <Box
          mt="25px"
          height="400px" // Adjust height as needed
        >
          <BarChart data={roleData} />
        </Box>
      </Box>

      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={selectedUser.name}
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation:</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  defaultValue={selectedUser.designation}
                />
              </div>
              <div className="form-group">
                <label htmlFor="accessLevel">Access Level:</label>
                <select name="accessLevel" defaultValue={selectedUser.status}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="personalEmail">Email:</label>
                <input
                  type="text"
                  id="personalEmail"
                  name="personalEmail"
                  defaultValue={selectedUser.personalEmail}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reportTo">Managed By:</label>
                <input
                  type="text"
                  id="reportTo"
                  name="reportTo"
                  defaultValue={selectedUser.reportTo}
                />
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={handlePopupClose}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </Box>
  );
};

export default Team;
